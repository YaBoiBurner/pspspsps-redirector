import { Hono } from 'hono'
import { Environment } from '../types'

export const names = [
  'burner',
  'cendyne',
  'lewis',
  'nic',
  'nican',
  'nico',
  'sparky',
  'zenith',
]

const bread = new Hono<Environment>()

bread.get('/', (ctx) => {
  const url = new URL(ctx.req.url)
  const { searchParams } = url
  const foundNames = names.filter((name: string) => searchParams.has(name))
  const name = foundNames[0] || names[Math.floor(Math.random() * names.length)]
  return ctx.redirect(
    `${ctx.env.STICKER_API_BASE}/${name}/glitch-bread`,
    foundNames[0] ? 301 : 302,
  )
})

bread.get('/list', (ctx) => ctx.json(names))

bread.get('/:name', (ctx) => {
  const { name } = ctx.req.param()
  if (names.includes(name)) {
    return ctx.redirect(`${ctx.env.STICKER_API_BASE}/${name}/glitch-bread`)
  }
  return ctx.notFound()
})

export default bread
