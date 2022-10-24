import { Context } from 'hono'

export async function getSticker<T extends string>(
  ctx: Context<T, Environment>,
  name: string,
) {
  const res = await fetch(`${ctx.env.STICKER_API_BASE}/glitchfur/${name}`)
  const { status } = res
  if (status === 200) {
    const headers = new Headers({
      'Content-Type': res.headers.get('Content-Type') as string,
    })
    return new Response(res.body, { status: status, headers: headers })
  }
  return null
}
