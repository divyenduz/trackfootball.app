'use client'

import { authClient } from '@/auth/auth-client'

export function LoginButton({ children }: { children?: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        authClient.signIn.social({
          provider: 'google',
          callbackURL: '/dashboard',
        })
      }}
    >
      {children ?? 'Login'}
    </button>
  )
}
