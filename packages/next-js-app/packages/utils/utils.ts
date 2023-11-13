import type { Post, User } from '@prisma/client'

export function ensureUser(user: User | null | undefined): user is User {
  if (Boolean(user)) {
    return true
  } else {
    return false
  }
}

export function ensurePost(post: Post | null | undefined): post is Post {
  if (Boolean(post)) {
    return true
  } else {
    return false
  }
}

// https://github.com/vercel/next.js/issues/22278#issuecomment-1009865850
export const namedComponent = async <T, N extends keyof T>(
  modPromise: Promise<T>,
  exportName: N
) => {
  const mod = await modPromise
  return mod[exportName]
}

export const stringify = (value: number | string): string => {
  if (typeof value === 'number') {
    return value.toString()
  }
  return value
}
