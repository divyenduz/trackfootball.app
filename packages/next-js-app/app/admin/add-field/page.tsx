import { UserType, sql } from '@trackfootball/database'
import { Metadata, ResolvingMetadata } from 'next'
import { MESSAGE_UNAUTHORIZED } from 'packages/auth/utils'
import { auth } from 'utils/auth'

import AddField from './AddField'
import { Post } from '.prisma/client'

export const metadata: Metadata = {
  title: `Admin | Add Field | TrackFootball`,
}

export async function getPostsWithoutFields() {
  const postsWithoutField = await sql<Post[]>`
  SELECT * FROM "Post"
  WHERE "fieldId" IS NULL
  ORDER BY "id" DESC
  LIMIT 10
  `

  return postsWithoutField
}
export default async function Activity() {
  let user = null
  try {
    user = await auth()
  } catch (e) {
    console.error(e)
  }
  if (!user || !(user.type === UserType.ADMIN)) {
    throw new Error(MESSAGE_UNAUTHORIZED)
  }

  const posts = await getPostsWithoutFields()

  return (
    <>
      <AddField posts={posts}></AddField>
    </>
  )
}
