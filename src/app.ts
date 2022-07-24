import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { etag } from 'hono/etag'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import UAIssues from './data/ua-issues.json'
import { bread, sign, sticker, vore } from './routers'
import { getSticker } from './sticker-api-helper'
import { redirectKey, yieldImage, yieldVideo } from './stores'

const app = new Hono<Environment>()

app.use(logger(), prettyJSON(), cors(), etag())

app.route('/sign', sign)
app.route('/bread', bread)
app.route('/vore', vore)
app.route('/sticker', sticker)

app.get('/:thing', async (ctx) => {
  const { thing } = ctx.req.param()

  const cache = await caches.open('pspspsps:cache')

  // We intentionally drop search params here because they don't mean anything
  const cacheURLOrig = new URL(ctx.req.url)
  const cacheURL = new URL(`/${thing}`, `${cacheURLOrig.origin}`)
  if (UAIssues.NEEDS_TWITTER_PROXY.includes(ctx.req.header('User-Agent'))) {
    cacheURL.searchParams.append('PROXY_TWITTER', 'true')
  }
  const cacheKey = cacheURL.toString()

  let res: Response | null | undefined

  res = await cache.match(cacheKey)
  if (!res) {
    console.log(`Cache miss for ${cacheKey}`)
    res = res || (await redirectKey(ctx, thing))
    res = res || (await getSticker(ctx, thing))
    res = res || (await yieldVideo(ctx, thing))
    res = res || (await yieldImage(ctx, thing))
    res = res || ctx.redirect(ctx.env.FALLBACK_REDIRECT)

    ctx.executionCtx.waitUntil(cache.put(cacheKey, res.clone()))
  }

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

app.get('*', (ctx) => ctx.redirect(ctx.env.FALLBACK_REDIRECT))

export default app
