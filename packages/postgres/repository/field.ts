import type { Field } from '@trackfootball/kanel'
import { Sql } from 'postgres'

export async function getFieldsByUsage(
  sql: Sql,
  usage: string
): Promise<Field[]> {
  const fields: Field[] = await sql`
    SELECT * FROM "Field" 
    WHERE usage = ${usage}
  `
  return fields
}

export async function getFieldsByName(
  sql: Sql,
  name: string
): Promise<Field[]> {
  const fields: Field[] = await sql`
    SELECT * FROM "Field" 
    WHERE name = ${name}
  `
  return fields
}

export async function getFieldById(
  sql: Sql,
  id: number
): Promise<Field | null> {
  const fields: Field[] = await sql`
    SELECT * FROM "Field" 
    WHERE id = ${id}
  `
  return fields[0] || null
}
