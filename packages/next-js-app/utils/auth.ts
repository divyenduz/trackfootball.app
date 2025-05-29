import 'server-only'

import { getCurrentUser } from './getCurrentUser'
import path from 'path'
import { CurrentUser } from '@trackfootball/database/repository/currentUser'

export class NotLoggedInError extends Error {
  message: string = 'User is not logged in'
  constructor(message?: string) {
    super()
    if (message) {
      this.message = message
    }
  }
}

async function authenticate() {
  // For AI agents to access the server without login
  if (
    Bun.env.UNSAFE_AUTH_BYPASS_USER === '1' ||
    Bun.env.UNSAFE_AUTH_BYPASS_USER === 'true'
  ) {
    const cwd = process.cwd()
    const userFile = Bun.file(path.join(cwd, 'unsafe_user.json'))
    const user = userFile.json()
    return user as unknown as CurrentUser
  }

  const user = await getCurrentUser()
  if (!user) {
    // throw new NotLoggedInError()
    return null
  }
  return user
}

export async function auth() {
  const user = await authenticate()
  return user
}
