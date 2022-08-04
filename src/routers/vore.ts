import { Hono } from 'hono'
import { Environment } from '../types'
import { CACHE } from '../utils'

const vore = new Hono<Environment>({ strict: false })

vore.get('/list', async (ctx) => {
  const kv = await ctx.env.DISCORD_IDS.list()
  const keys = kv.keys.map((key) => key.name)
  return ctx.json(keys)
})

vore.get('/:id{[0-9]+}', (ctx) => {
  const { id } = ctx.req.param()
  return ctx.redirect(`${ctx.env.ZTICKER}/glitch_vore/${id}`)
})

vore.get('/:name', async (ctx) => {
  const cache = await CACHE()
  const { origin, pathname } = new URL(ctx.req.url)
  const cacheURL = new URL(pathname, origin)
  const cacheKey = cacheURL.toString()

  let res = await cache.match(cacheKey)
  if (!res) {
    const { name } = ctx.req.param()
    const id = await ctx.env.DISCORD_IDS.get(name)
    if (id) {
      res = ctx.redirect(`${ctx.env.ZTICKER}/glitch_vore/${id}`)
      res.headers.append('Cache-Control', 's-maxage=86400')
    } else {
      // why is this a promise?
      res = await ctx.notFound()
      res.headers.append('Cache-Control', 's-maxage=3600')
    }

    ctx.executionCtx.waitUntil(cache.put(cacheKey, res.clone()))
  }
  return res
})

// This has to be the fallback route to cover /vore/ and /vore
vore.get('*', (ctx) =>
  ctx.redirect(`${ctx.env.STICKER_API_BASE}/glitchfur/vore`, 301),
)

export default vore
