import { SocialLogin, User } from '@prisma/client'
import { getUserWithSocialLoginsByAuth0Sub } from './user'

export type CurrentUser = (User & { socialLogin: SocialLogin[] }) | null

export async function getCurrentUserByAuth0Sub(
  auth0Sub: string,
): Promise<CurrentUser> {
  return await getUserWithSocialLoginsByAuth0Sub(auth0Sub)
}
