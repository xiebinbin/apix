import "dotenv/config";
// import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { AccessRecordService } from '@/services/AccessRecordService'
import { redis } from "./libs/redis";
import * as Crypto from "crypto";

const app = new Hono<{
  Variables: {
    packageName: string
    uuid: string
  }
}>()
app.use('*', async (c, next) => {
  const packageName = c.req.header('package-name') ?? 'demox'
  if (!packageName) {
    return c.json({ code: 400, message: 'package-name is required' }, 400)
  }
  const uuid = c.req.header('uuid') ?? 'demo'
  if (!uuid) {
    return c.json({ code: 400, message: 'uuid is required' }, 400)
  }
  c.set('packageName', packageName)
  c.set('uuid', uuid)
  return next()
})
app.all('/api/access-record/create', async (c) => {
  const { packageName, uuid } = c.var;
  const key = Crypto.createHash('sha256').update(`${packageName}-${uuid}`).digest('hex')
  const rel = await redis.set(`limit-req:${key}`, 'locked', 'PX', 5000, 'NX')
  let result = false;
  if (rel == "OK") {
    const total = await AccessRecordService.getTotal(packageName);

    if (total < process.env.MAX_REQUEST_COUNT) {
      result = await AccessRecordService.createRecord(uuid, packageName);
    }
  }
  return c.json({
    code: 200,
    message: 'success',
    data: {
      result
    }
  })
})

const port = process.env.API_PORT
console.log(`Server is running on http://localhost:${port}`)
export default {
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
}