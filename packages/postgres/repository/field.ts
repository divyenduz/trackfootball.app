import type { Field } from '../types'
import { Sql } from 'postgres'

export async function getFieldsByUsage(
  sql: Sql,
  usage: string,
): Promise<Field[]> {
  const fields: Field[] = await sql`
    SELECT * FROM "Field" 
    WHERE usage = ${usage}
  `
  return fields
}

export async function getFieldsByName(
  sql: Sql,
  name: string,
): Promise<Field[]> {
  const fields: Field[] = await sql`
    SELECT * FROM "Field" 
    WHERE name = ${name}
  `
  return fields
}
