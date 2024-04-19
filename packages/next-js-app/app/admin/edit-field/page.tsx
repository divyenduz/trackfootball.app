import { Field, UserType, sql } from '@trackfootball/database'
import { redirect } from 'next/navigation'
import { auth } from 'utils/auth'

import EditField from './EditField'

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

export default async function EditFieldFn() {
  let user = null
  try {
    user = await auth()
  } catch (e) {}
  if (!user || !(user.type === UserType.ADMIN)) {
    redirect('/')
  }
  const fields = await getFields()

  return (
    <div className="w-full max-w-4xl">
      <EditField fields={fields}></EditField>
    </div>
  )
}
