import { defineApp } from 'rwsdk/worker'
import { route, render, layout } from 'rwsdk/router'
import { Document } from '@/app/Document'
import { setCommonHeaders } from '@/app/headers'
import { Home } from './app/pages/Home'
import { AppLayout } from '@/layouts/AppLayout'
import { Dashboard } from './app/pages/dashboard/Dashboard'
import { env } from 'cloudflare:workers'
import invariant from 'tiny-invariant'
import { Sql } from 'postgres'
import { createRepository, getSql } from '@trackfootball/postgres'
import { Athlete } from './app/pages/athlete/Athlete'
import { Activity } from './app/pages/activity/Activity'
import { getSession } from './auth/lib'
import { hkdf } from '@panva/hkdf'
import { Logout } from './app/pages/api/auth/logout'
import { Callback } from './app/pages/api/auth/callback'
import { Login } from './app/pages/api/auth/login'
import { StravaAuthCallback } from './app/pages/strava/StravaAuthCallback'
import { StravaWebhookCallback } from './app/pages/strava/StravaWebhookCallback'
import { Privacy } from './app/pages/compliance/Privacy'
import { Terms } from './app/pages/compliance/Terms'
import { User } from '@trackfootball/kanel'

export type AppContext = {
  user: User | null
  sql: Sql
  repository: ReturnType<typeof createRepository>
}

function needsAuth({ ctx }: { ctx: AppContext }) {
  if (!ctx.user) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/' },
    })
  }
}

const DIGEST = 'sha256'
const BYTE_LENGTH = 32
const ENCRYPTION_INFO = 'JWE CEK'

async function getSecret() {
  const secret = await hkdf(
    DIGEST,
    env.AUTH0_SECRET,
    '',
    ENCRYPTION_INFO,
    BYTE_LENGTH
  )
  return secret
}

export default defineApp([
  setCommonHeaders(),
  async ({ ctx, request }) => {
    invariant(env.HYPERDRIVE.connectionString, 'DATABASE_URL is required')
    const sql = getSql(env.HYPERDRIVE.connectionString)
    const repository = createRepository(sql)
    ctx.repository = repository

    const session = await getSession(request.headers)
    ctx.user = null
    if (session) {
      const user = await repository.getUserByAuth0Sub(session.sub)
      ctx.user = user
    }
  },
  // @ts-expect-error fix document types
  render(Document, [
    layout(AppLayout, [
      route('/', ({ ctx }) => {
        if (ctx.user) {
          return new Response(null, {
            status: 302,
            headers: { Location: '/dashboard' },
          })
        }
        return new Response(null, {
          status: 302,
          headers: { Location: '/home' },
        })
      }),
      route('/home', Home),
      route('/dashboard', [needsAuth, Dashboard]),
      route('/athlete/:id', [Athlete]),
      route('/activity/:id', [Activity]),
      route('/api/auth/login', [Login]),
      route('/api/auth/callback', [Callback]),
      route('/api/auth/logout', [Logout]),
      route('/api/social/strava/callback', [StravaAuthCallback]),
      route('/api/social/strava/webhook/callback', [StravaWebhookCallback]),
      route('/privacy', [Privacy]),
      route('/terms', [Terms]),
    ]),
  ]),
])
