import { Field } from '@prisma/client'
import { sql } from '../index'

export async function getFieldsByUsage(usage: string): Promise<Field[]> {
  const fields: Field[] = await sql`
    SELECT * FROM "Field" 
    WHERE usage = ${usage}
  `
  return fields
}

export async function getFieldsByName(name: string): Promise<Field[]> {
  const fields: Field[] = await sql`
    SELECT * FROM "Field" 
    WHERE name = ${name}
  `
  return fields
}

export async function getFieldById(id: number): Promise<Field | null> {
  const fields: Field[] = await sql`
    SELECT * FROM "Field" 
    WHERE id = ${id}
  `
  return fields[0] || null
}