import 'server-only'

import { getCurrentUser } from './getCurrentUser'
import path from 'path'
import fs from 'fs'
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
    process.env.UNSAFE_AUTH_BYPASS_USER === '1' ||
    process.env.UNSAFE_AUTH_BYPASS_USER === 'true'
  ) {
    const cwd = process.cwd()
    const userFilePath = path.join(cwd, 'unsafe_user.json')
    const userFileContent = fs.readFileSync(userFilePath, 'utf-8')
    const user = JSON.parse(userFileContent)
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
