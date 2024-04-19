import { UserType, sql } from '@trackfootball/database'
import { MESSAGE_UNAUTHORIZED } from 'packages/auth/utils'
import { auth } from 'utils/auth'

import EditField from './EditField'
import { Field } from '.prisma/client'

export const metadata = {
  title: `Admin | Edit Field | TrackFootball`,
}

export async function getFields() {
  const fields = await sql<Field[]>`
    SELECT * FROM "Field"
    ORDER BY "id" DESC
    `

  return fields
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
  const fields = await getFields()

  return (
    <div className="w-full max-w-4xl">
      <EditField fields={fields}></EditField>
    </div>
  )
}
