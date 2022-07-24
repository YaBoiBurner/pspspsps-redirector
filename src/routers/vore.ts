import { Hono } from 'hono'

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
  const { name } = ctx.req.param()
  const id = await ctx.env.DISCORD_IDS.get(name)
  if (id) {
    return ctx.redirect(`${ctx.env.ZTICKER}/glitch_vore/${id}`)
  }
  return ctx.notFound()
})

// This has to be the fallback route to cover /vore/ and /vore
vore.get('*', (ctx) =>
  ctx.redirect(`${ctx.env.STICKER_API_BASE}/glitchfur/vore`, 301),
)

export default vore
