import { UserType, sql } from '@trackfootball/database'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
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
export default async function AddFieldFn() {
  let user = null
  try {
    user = await auth()
  } catch (e) {}

  if (!user || !(user.type === UserType.ADMIN)) {
    redirect('/')
  }

  const posts = await getPostsWithoutFields()

  return (
    <div className="w-full max-w-4xl">
      <AddField posts={posts}></AddField>
    </div>
  )
}
