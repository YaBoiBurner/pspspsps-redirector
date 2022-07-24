import { Context } from 'hono'
import UAIssues from './data/ua-issues.json'

export async function redirectKey<T extends string>(
  ctx: Context<T, Environment>,
  key: string,
) {
  const val = await ctx.env.REDIRECTS.get(key)
  const ua = ctx.req.header('User-Agent')
  if (val) {
    if (UAIssues.NEEDS_TWITTER_PROXY.includes(ua)) {
      return ctx.redirect(
        val.replace(/:\/\/twitter\.com/, `://${ctx.env.TWITTER_CARD_PROXY}`),
        302,
      )
    }
    return ctx.redirect(val, 302)
  }
}

export async function yieldImage<T extends string>(
  ctx: Context<T, Environment>,
  key: string,
) {
  const image = await ctx.env.IMAGES.get(`${key}.webp`)
  if (image) {
    ctx.header('Content-Type', 'image/webp')
    ctx.header('Cache-Control', 'public, max-age=31536000')
    return ctx.body(image.body, 200)
  }
}

export async function yieldVideo<T extends string>(
  ctx: Context<T, Environment>,
  key: string,
) {
  const video = await ctx.env.IMAGES.get(`${key}.mp4`)
  if (video) {
    ctx.header('Content-Type', 'video/mp4')
    ctx.header('Cache-Control', 'public, max-age=31536000')
    return ctx.body(video.body, 200)
  }
}
