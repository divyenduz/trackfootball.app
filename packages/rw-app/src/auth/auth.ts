import { betterAuth } from 'better-auth'
import { env } from 'cloudflare:workers'
import postgres from 'postgres'
import invariant from 'tiny-invariant'
import { PostgresJSDialect } from 'kysely-postgres-js'

export function createAuth() {
  invariant(env.DATABASE_URL, 'DATABASE_URL is required')
  invariant(env.BETTER_AUTH_SECRET, 'BETTER_AUTH_SECRET is required')

  return betterAuth({
    database: {
      dialect: new PostgresJSDialect({
        postgres: postgres(env.DATABASE_URL, {
          connection: { search_path: 'better_auth' },
        }),
      }),
      type: 'postgres',
    },
    baseURL: env.BETTER_AUTH_URL,
    basePath: '/api/auth',
    secret: env.BETTER_AUTH_SECRET,
    appName: 'TrackFootball',

    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },

    session: {
      expiresIn: 7 * 24 * 60 * 60,
      cookieCache: {
        maxAge: 60 * 5,
      },
    },

    trustedOrigins: [env.BETTER_AUTH_URL],

    advanced: {
      useSecureCookies: true,
      cookiePrefix: 'trackfootball',
    },

    user: {
      additionalFields: {
        firstName: {
          type: 'string',
          required: false,
        },
        lastName: {
          type: 'string',
          required: false,
        },
        locale: {
          type: 'string',
          required: false,
          defaultValue: 'en',
        },
        type: {
          type: 'string',
          required: false,
          defaultValue: 'USER',
          input: false,
        },
        auth0Sub: {
          type: 'string',
          required: false,
          input: false,
        },
        picture: {
          type: 'string',
          required: false,
        },
      },
      fields: {
        image: 'picture',
      },
    },

    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            return {
              data: {
                ...user,
                firstName: user.name?.split(' ')[0] ?? null,
                lastName: user.name?.split(' ').slice(1).join(' ') ?? null,
              },
            }
          },
        },
      },
    },
  })
}

