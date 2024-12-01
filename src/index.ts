import "dotenv/config";
// import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { redis } from "./libs/redis";
import * as Crypto from "crypto";
import { AdStatisticService } from "./services/AdStatisticService";
import { zValidator } from '@hono/zod-validator'
import { z } from "zod";
import dayjs from "dayjs";
import { logger } from "hono/logger";

const app = new Hono<{
  Variables: {
    packageName: string
    uuid: string
  }
}>()
app.use('*', logger())
app.use('*', async (c, next) => {
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
  c.set('packageName', packageName)
  c.set('uuid', uuid)
  await next()
  await redis.del(reqQueueKey)
})
app.post('/api/ad-statistic/status', zValidator('json', z.object({
  adId: z.string(),
})), async (c) => {
  const { adId } = c.req.valid('json');
  const { packageName } = c.var;
  const record = await AdStatisticService.getLatest(adId, packageName);
  const result = record?.successCount ? record?.successCount < process.env.MAX_REQUEST_COUNT : true;
  return c.json({
    code: 200,
    message: 'success',
    data: {
      result
    }
  })
})
app.post('/api/ad-statistic/run', zValidator('json', z.object({
  adId: z.string(),
  status: z.number().int(),
})), async (c) => {
  const { adId, status } = c.req.valid('json');
  console.log(adId, status)
  let adStatistic = await AdStatisticService.getLatest(adId, c.var.packageName);
  if (!adStatistic) {
    adStatistic = await AdStatisticService.create({
      adId,
      failCount: 0,
      successCount: 0,
      expiredAt: dayjs().add(20, 'hours').toDate()
    });
  }
  await AdStatisticService.recordRunLog({
    adId,
    status,
    uuid: c.var.uuid,
    packageName: c.var.packageName
  })
  return c.json({
    code: 200,
    message: 'success',
    data: null
  })
})

app.post('/api/ad-statistic/init', zValidator('json', z.object({
  adId: z.string(),
  status: z.number().int(),
})), async (c) => {
  const { adId, status } = c.req.valid('json');
  let adStatistic = await AdStatisticService.getLatest(adId, c.var.packageName);
  if (!adStatistic) {
    adStatistic = await AdStatisticService.create({
      adId,
      failCount: 0,
      successCount: 0,
      expiredAt: dayjs().add(20, 'hours').toDate()
    });
  }
  await AdStatisticService.recordInitLog({
    adId,
    status,
    uuid: c.var.uuid,
    packageName: c.var.packageName
  })
  return c.json({
    code: 200,
    message: 'success',
    data: null
  })
})

const port = process.env.API_PORT
console.log(`Server is running on http://localhost:${port}`)
export default {
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
}