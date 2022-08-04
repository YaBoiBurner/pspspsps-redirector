import Toucan from 'toucan-js'
import app from './app'
import { CFEnvironment, Environment } from './types'

export default {
  fetch(request: Request, env: CFEnvironment, ctx: ExecutionContext) {
    const SENTRY = new Toucan({
      dsn: env.SENTRY_DSN,
      context: ctx,
      request: request,
      allowedHeaders: ['User-Agent'],
      allowedSearchParams: /(.*)/,
    })
    const newEnv: Environment = {
      SENTRY: SENTRY,
      ...env,
    }
    try {
      return app.fetch(request, newEnv, ctx)
    } catch (err) {
      SENTRY.captureException(err)
      return new Response('Something went wrong', {
        status: 500,
        statusText: 'Internal Server Error',
      })
    }
  },
}
