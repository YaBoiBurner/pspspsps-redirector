import { sentry } from '@honojs/sentry'
import { Hono } from 'hono'
import { cache } from 'hono/cache'
import { cors } from 'hono/cors'
import { etag } from 'hono/etag'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { bread, sign, sticker, vore } from './routers'
import { getSticker } from './sticker-api-helper'
import { redirectKey, yieldImage, yieldVideo } from './stores'

const app = new Hono<Environment>()

app.use('*', logger(), prettyJSON(), cors(), etag(), sentry())
app.get(
  '*',
  cache({ cacheName: 'pspspsps', cacheControl: 'public, max-age=31536000' }),
)

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

  res.headers.append('Cache-Control', 's-maxage=86400')

  return res
})

app.get('*', (ctx) => ctx.redirect(ctx.env.FALLBACK_REDIRECT))

export default app
