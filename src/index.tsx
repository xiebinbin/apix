import "dotenv/config";
import { Hono } from 'hono'
import { redis } from "./libs/redis";
import * as Crypto from "crypto";
import { zValidator } from '@hono/zod-validator'
import { z } from "zod";
import dayjs from "dayjs";
import { logger } from "hono/logger";
import { ChannelService } from "./services/ChannelService";
import { AdLogService } from "./services/AdLogService";
import type { AdLogStatus, Channel, SdkLogStatus, Prisma } from "@prisma/client";
import { SdkLogService } from "./services/SdkLogService";
import { StatusCheckStatisticService } from "./services/StatusCheckStatisticService";
import { SdkDayStatisticService } from "./services/SdkDayStatisticService";
import { AdDayStatisticService } from "./services/AdDayStatisticService";
const app = new Hono<{
  Variables: {
    packageName: string
    uuid: string;
    model: string;
    osVersion: string;
    channel: Channel;
    // 权限状态:  1. 不满足 2. 满足
    permissionStatus: string;
  }
}>()

app.use('*', logger())
app.use('/api/*', async (c, next) => {
  const packageName = c.req.header('package-name') ?? 'demox'
  if (!packageName) {
    return c.json({ code: 400, message: 'package-name is required' }, 400)
  }
  const uuid = c.req.header('uuid') ?? 'demo'
  if (!uuid) {
    return c.json({ code: 400, message: 'uuid is required' }, 400)
  }
  const reqQueueKey = `limit-req:${Crypto.createHash('sha256').update(`${packageName}-${uuid}`).digest('hex')}`
  const rel = await redis.set(reqQueueKey, 'locked', 'PX', 5000, 'NX')
  if (!rel) {
    return c.json({ code: 429, message: 'too many requests' }, 429)
  }
  const channelName = c.req.header('channel-name')
  if (!channelName) {
    return c.json({ code: 400, message: 'channel-name is required' }, 400)
  }
  const channel = await ChannelService.findByName(channelName)
  if (!channel) {
    return c.json({ code: 400, message: 'channel is not found' }, 400)
  }
  const model = c.req.header('model')
  if (!model) {
    return c.json({ code: 400, message: 'model is required' }, 400)
  }
  const osVersion = c.req.header('os-version')
  if (!osVersion) {
    return c.json({ code: 400, message: 'os-version is required' }, 400)
  }
  c.set('packageName', packageName)
  c.set('uuid', uuid)
  c.set('channel', channel)
  c.set('model', model)
  c.set('osVersion', osVersion)
  await next()
  await redis.del(reqQueueKey)
})
// 获取系统状态
app.post('/api/sys/status', zValidator('json', z.object({
  adId: z.string(),
})), async (c) => {
  const { channel, packageName } = c.var;
  const { adId } = c.req.valid('json');
  const adLog = await AdLogService.getLastShowSuccessLog(packageName, channel.id, adId)
  const channelPower = channel?.power ?? 'off';
  const adPower = adLog ? 'off' : 'on';
  await StatusCheckStatisticService.updateToday(packageName, channel.id, adId, adPower as "on" | "off", channelPower as "on" | "off")
  return c.json({
    code: 200,
    message: 'success',
    data: {
      channel_power: channelPower,
      ad_power: adPower
    }
  })
})
// sdk状态上报
app.post('/api/sdk/log', zValidator('json', z.object({
  // 状态: INIT_SUCCESS.初始化成功 INIT_FAIL.初始化失败 WAKE_UP.唤醒
  status: z.enum(['INIT_SUCCESS', 'INIT_FAIL', 'WAKE_UP']),
})), async (c) => {
  const { channel, packageName } = c.var;
  const { status } = c.req.valid('json');
  await SdkLogService.create({
    status: status as SdkLogStatus,
    channelId: channel.id,
    model: c.var.model,
    osVersion: c.var.osVersion,
    packageName,
    uuid: c.var.uuid,
  })
  const data: Prisma.SdkDayStatisticUpdateInput = {
    initFailCount: status === 'INIT_FAIL' ? {
      increment: 1
    } : undefined,
    initSuccessCount: status === 'INIT_SUCCESS' ? {
      increment: 1
    } : undefined,
    wakeUpCount: status === 'WAKE_UP' ? {
      increment: 1
    } : undefined
  }
  await SdkDayStatisticService.updateToday(packageName, channel.id, data)
  return c.json({
    code: 200,
    message: 'success',
  })
})

// ad状态上报
app.post('/api/ad/log', zValidator('json', z.object({
  adId: z.string(),
  // 状态: INIT_SUCCESS.初始化成功 INIT_FAIL.初始化失败 SHOW_SUCCESS.展现成功 SHOW_FAIL.展现失败 CLICK_SUCCESS.点击成功 CLICK_FAIL.点击失败 PLAY_SUCCESS.播放成功 PLAY_FAIL.播放失败 DIALOG_SUCCESS.对话成功 DIALOG_FAIL.对话失败
  status: z.enum(['INIT_SUCCESS', 'INIT_FAIL', 'SHOW_SUCCESS', 'SHOW_FAIL', 'CLICK_SUCCESS', 'CLICK_FAIL', 'PLAY_SUCCESS', 'PLAY_FAIL', 'DIALOG_SUCCESS', 'DIALOG_FAIL']),
})), async (c) => {
  const { channel, packageName } = c.var;
  const { adId, status } = c.req.valid('json');
  await AdLogService.create({
    adId,
    status: status as AdLogStatus,
    channelId: channel.id,
    model: c.var.model,
    osVersion: c.var.osVersion,
    packageName,
    uuid: c.var.uuid,
  })
  const data: Prisma.AdDayStatisticUpdateInput = {
    initSuccessCount: status === 'INIT_SUCCESS' ? {
      increment: 1
    } : undefined,
    initFailCount: status === 'INIT_FAIL' ? {
      increment: 1
    } : undefined,
    showSuccessCount: status === 'SHOW_SUCCESS' ? {
      increment: 1
    } : undefined,
    showFailCount: status === 'SHOW_FAIL' ? {
      increment: 1
    } : undefined,
    clickSuccessCount: status === 'CLICK_SUCCESS' ? {
      increment: 1
    } : undefined,
    clickFailCount: status === 'CLICK_FAIL' ? {
      increment: 1
    } : undefined,
    requestSuccessCount: status === 'INIT_SUCCESS' ? {
      increment: 1
    } : undefined,
    requestFailCount: status === 'INIT_FAIL' ? {
      increment: 1
    } : undefined,
    playSuccessCount: status === 'PLAY_SUCCESS' ? {
      increment: 1
    } : undefined,
    playFailCount: status === 'PLAY_FAIL' ? {
      increment: 1
    } : undefined,
    dialogSuccessCount: status === 'DIALOG_SUCCESS' ? {
      increment: 1
    } : undefined,
    dialogFailCount: status === 'DIALOG_FAIL' ? {
      increment: 1
    } : undefined,
  }
  await AdDayStatisticService.updateToday(packageName, channel.id, adId, data)
  return c.json({
    code: 200,
    message: 'success',
  })
})


app.get("/query", async (c) => {
  let page = parseInt(c.req.query('page') ?? '1')
  let limit = parseInt(c.req.query('limit') ?? '100')
  const adId = c.req.query('adId') ?? '';
  const packageName = c.req.query('packageName') ?? '';
  if (page <= 0) {
    page = 1
  }
  if (limit <= 0 || limit >= 100) {
    limit = 50;
  }
  const items: any[] = [];
  console.log(items);
  return c.html(<html>
    <head>
      <meta charset="utf-8" />
    </head>
    <body>
      {items.map((item) => {
        return <p>日期:{dayjs(item.createdAt).format("YYYY-MM-DD")},初始化成功次数:{item.initSuccessCount},广告成功次数:{item.successCount},初始失败次数:{item.initFailCount},广告失败次数:{item.failCount},状态请求次数:{item.requestStatusCount},请求成功次数:{item.requestSuccessCount}</p>
      })}
    </body>
  </html>)
})
const port = process.env.API_PORT
console.log(`Server is running on http://localhost:${port}`)
export default {
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
}