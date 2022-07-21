import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { Environment } from '../types'

const sign = new Hono<Environment>()

sign.use(prettyJSON())

sign.get('/', async (ctx) => {
  const result = await ctx.env.SIGNS.list()
  const names = result.keys.map((k) => k.name)
  return ctx.json(names)
})

sign.get('/:text', async (ctx) => {
  const bunnypaws = `${ctx.env.BUNNYPAWS}/image/stickers/glitchfursigns`

  const { text } = ctx.req.param()
  const name = decodeURIComponent(text)

  let maybeID: string | null | undefined
  maybeID = maybeID || (await ctx.env.SIGNS.get(name))
  maybeID = maybeID || (await ctx.env.SIGNS.get(name.toLowerCase()))
  maybeID = maybeID || (await ctx.env.SIGNS.get(name.toUpperCase()))
  const id = maybeID

  if (id) {
    return ctx.redirect(`${bunnypaws}/${id}.webp`)
  }
  return ctx.redirect(`${ctx.env.ZTICKER}/glitch/${text}`)
})

export default sign
