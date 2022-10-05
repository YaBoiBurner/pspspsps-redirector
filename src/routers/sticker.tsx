import { Hono } from 'hono'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from 'hono/jsx'
import UAIssues from '../data/ua-issues.json'

const sticker = new Hono<Environment>()

const Card = (props: {
  title: string
  type: 'summary' | 'summary_large_image'
  creator: string
  image: string
  alt_text?: string
}) => (
  <html>
    <head>
      <meta charset="utf-8" />
      <title>{props.title}</title>
      <meta name="twitter:card" content={props.type} />
      <meta name="twitter:creator" content={props.creator} />
      <meta name="twitter:title" content={props.title} />
      <meta name="twitter:image" content={props.image} />
      <meta name="twitter:image:alt" content={props.alt_text || props.title} />
    </head>
  </html>
)

sticker.get('/list', (ctx) =>
  fetch(`${ctx.env.STICKER_API_BASE}/glitchfur/details`),
)

sticker.get('/:name', (ctx) => {
  const { name } = ctx.req.param()
  const ua = ctx.req.header('User-Agent')
  if (UAIssues.NEEDS_TWITTER_CARD.includes(ua)) {
    return ctx.html(
      <Card
        title={name}
        type="summary_large_image"
        creator="@BurnerWah"
        image={`${ctx.env.STICKER_API_BASE}/glitchfur/${name}`}
      />,
    )
  } else {
    return ctx.redirect(`${ctx.env.STICKER_API_BASE}/glitchfur/${name}`)
  }
})

export default sticker
