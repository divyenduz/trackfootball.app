import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import type { createAuth } from './auth'

export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [inferAdditionalFields<ReturnType<typeof createAuth>>()],
})

export const { signIn, signOut, useSession } = authClient
