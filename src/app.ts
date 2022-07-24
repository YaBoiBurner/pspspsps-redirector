import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { etag } from 'hono/etag'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import UAIssues from './data/ua-issues.json'
import { bread, sign, sticker, vore } from './routers'
import { getSticker } from './sticker-api-helper'
import { redirectKey, yieldImage, yieldVideo } from './stores'
import { CACHE } from './utils'

const app = new Hono<Environment>()

app.use(logger(), prettyJSON(), cors(), etag())

app.route('/sign', sign)
app.route('/bread', bread)
app.route('/vore', vore)
app.route('/sticker', sticker)

app.get('/:thing', async (ctx) => {
  const { thing } = ctx.req.param()

  const cache = await CACHE()

  // We only keep the origin from the original URL to maximize the likelihood of a cach hit
  // It also lets us use search params to denotate special cases
  const { origin } = new URL(ctx.req.url)
  const cacheURL = new URL(`/${thing}`, `${origin}`)
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

    res.headers.append('Cache-Control', 's-maxage=86400')

    ctx.executionCtx.waitUntil(cache.put(cacheKey, res.clone()))
  } else {
    console.log(`Cache hit for ${cacheKey}`)
  }

  return res
})

app.get('/:thing/raw', async (ctx) => {
  const { thing } = ctx.req.param()

  const cache = await CACHE()

  const { origin } = new URL(ctx.req.url)
  const cacheURL = new URL(`/${thing}/raw`, origin)
  const cacheKey = cacheURL.toString()

  let res: Response | null | undefined

  res = await cache.match(cacheKey)
  if (!res) {
    console.log(`Cache miss for ${cacheKey}`)
    res = res || (await yieldVideo(ctx, thing))
    res = res || (await yieldImage(ctx, thing))
    res = res || ctx.redirect(ctx.env.FALLBACK_REDIRECT)

    res.headers.append('Cache-Control', 's-maxage=86400')

    ctx.executionCtx.waitUntil(cache.put(cacheKey, res.clone()))
  } else {
    console.log(`Cache hit for ${cacheKey}`)
  }

  return res
})

app.get('*', (ctx) => ctx.redirect(ctx.env.FALLBACK_REDIRECT))

export default app
