import { Context } from 'hono'
import { Environment } from './types'

export async function getSticker<T extends string>(
  ctx: Context<T, Environment>,
  name: string,
) {
  const res = await fetch(`${ctx.env.STICKER_API_BASE}/glitchfur/${name}`)
  if (res.status === 200) {
    return res
  }
  return null
}
