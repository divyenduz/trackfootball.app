import { getCurrentUserByAuth0Sub } from '@trackfootball/database/repository/currentUser'

import auth0 from './auth0'

export async function getCurrentUser() {
  const session = await auth0.getSession()
  if (!session) {
    return null
  }

  return await getCurrentUserByAuth0Sub(session.user.sub)
}
