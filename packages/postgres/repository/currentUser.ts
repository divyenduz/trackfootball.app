import type { User, SocialLogin } from '@trackfootball/kanel'
import { Sql } from 'postgres'
import { getUserWithSocialLoginsByAuth0Sub } from './user'

export type CurrentUser = (User & { socialLogin: SocialLogin[] }) | null

export async function getCurrentUserByAuth0Sub(
  sql: Sql,
  auth0Sub: string
): Promise<CurrentUser> {
  return await getUserWithSocialLoginsByAuth0Sub(sql, auth0Sub)
}
