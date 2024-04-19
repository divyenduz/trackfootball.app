import 'server-only'

import { getCurrentUser } from './getCurrentUser'

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
  const user = await getCurrentUser()
  if (!user) {
    throw new NotLoggedInError()
  }
  return user
}

export async function auth() {
  const user = await authenticate()

  return user
}
