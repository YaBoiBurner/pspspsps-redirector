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
    return new Response(image.body, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
      },
    })
  }
}

export async function yieldVideo<T extends string>(
  ctx: Context<T, Environment>,
  key: string,
) {
  const video = await ctx.env.IMAGES.get(`${key}.mp4`)
  if (video) {
    return new Response(video.body, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
      },
    })
  }
}
