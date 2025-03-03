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
app.use('*', async (c, next) => {
  // 打印请求头
  console.log(c.req.header())
  // 打印请求体
  console.log(await c.req.json())
  await next()
})
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
  const uuid = c.var.uuid
  const adLog = await AdLogService.getLastShowSuccessLog(packageName, channel.id, adId, uuid);
  console.log("adLog",adLog)
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
  const category = c.req.query('category') ?? '';
  const adId = c.req.query('adId') ?? '';
  const packageName = c.req.query('packageName') ?? '';
  const channelName = c.req.query('channelName') ?? '';
  if (category == '') {
    return c.html(<html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <form action="/query" method="get" target="_blank">
          <label for="adId">广告ID:</label>
          <input type="text" id="adId" name="adId"/>
          <br/>
          <label for="packageName">包名:</label>
          <input type="text" id="packageName" name="packageName" required/>
          <br/>
          <label for="channelName">渠道名:</label>
          <input type="text" id="channelName" name="channelName" required/>
          <br/>
          <label for="category">类别:</label>
          <select id="category" name="category" required>
            <option value="ad">广告</option>
            <option value="sdk">SDK</option>
            <option value="status-check">状态检测</option>
          </select>
          <br/>
          <input type="submit" value="查询"/>
        </form>
      </body>
    </html>)
  }
  const channel = await ChannelService.findByName(channelName)
  if (!channel) {
    return c.json({ code: 400, message: 'channel is not found' }, 400)
  }
  if (category == 'ad') {
    const items = await AdDayStatisticService.getList(packageName, channel.id, adId)
    return c.html(<html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        <h1>广告数据</h1>
        {items.map((item) => {
          return <p>日期:{dayjs(item.date).format("YYYY-MM-DD")},系统初始化成功次数:{item.initSuccessCount},系统初始化失败次数:{item.initFailCount},广告请求次数:{item.requestSuccessCount},广告请求失败次数:{item.requestFailCount},广告展现成功次数:{item.showSuccessCount},广告展现失败次数:{item.showFailCount},广告点击成功次数:{item.clickSuccessCount},广告点击失败次数:{item.clickFailCount},对话成功次数:{item.dialogSuccessCount},对话失败次数:{item.dialogFailCount},播放成功次数:{item.playSuccessCount},播放失败次数:{item.playFailCount}</p>
        })}
      </body>
    </html>)
  }
  if (category == 'sdk') {
    const items = await SdkDayStatisticService.getList(packageName, channel.id)
    return c.html(<html>
      <head>
      <meta charset="utf-8" />
    </head>
    <body>
      {items.map((item) => {
        return <p>日期:{dayjs(item.date).format("YYYY-MM-DD")},初始化成功次数:{item.initSuccessCount},初始失败次数:{item.initFailCount},唤醒次数:{item.wakeUpCount}</p>
      })}
    </body>
  </html>)
  }
  if (category == 'status-check') {
    const items = await StatusCheckStatisticService.getList(packageName, channel.id, adId)
    return c.html(<html>
      <head>
        <meta charset="utf-8" />
      </head>
      <body>
        {items.map((item) => {
          return <p>日期:{dayjs(item.date).format("YYYY-MM-DD")},渠道开启次数:{item.channelOnCount},渠道关闭次数:{item.channelOffCount},广告开启次数:{item.adOnCount},广告关闭次数:{item.adOffCount}</p>
        })}
      </body>
    </html>)
  }
})
const port = process.env.API_PORT
console.log(`Server is running on http://localhost:${port}`)
export default {
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
}