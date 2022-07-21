import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import bread from './routers/bread'
import sign from './routers/signs'
import sticker from './routers/sticker'
import vore from './routers/vore'
import { Environment } from './types'
import { redirectKey, yieldImage, yieldVideo } from './stores'
import { getSticker } from './sticker-api-helper'
import { cors } from 'hono/cors'
import { etag } from 'hono/etag'

const app = new Hono<Environment>()

app.use(logger(), prettyJSON(), cors(), etag())

app.route('/sign', sign)
app.route('/bread', bread)
app.route('/vore', vore)
app.route('/sticker', sticker)

app.get('/:thing', async (ctx) => {
  const { thing } = ctx.req.param()

  let res: Response | null | undefined
  res = res || (await redirectKey(ctx, thing))
  res = res || (await getSticker(ctx, thing))
  res = res || (await yieldVideo(ctx, thing))
  res = res || (await yieldImage(ctx, thing))
  res = res || ctx.redirect(ctx.env.FALLBACK_REDIRECT)

  return res
})

app.get('/:thing/raw', async (ctx) => {
  const { thing } = ctx.req.param()

  let res: Response | null | undefined
  res = res || (await yieldVideo(ctx, thing))
  res = res || (await yieldImage(ctx, thing))
  res = res || ctx.redirect(ctx.env.FALLBACK_REDIRECT)

  return res
})

export default app
