import dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config()

let sql: postgres.Sql<{}>

if (!process.browser) {
  // check to use this workaround only in development and not in production
  if (process.env.NODE_ENV === 'production') {
    sql = postgres(process.env.DATABASE_URL)
  } else {
    //@ts-expect-error
    if (!global.sql) {
      //@ts-expect-error
      global.sql = postgres(process.env.DATABASE_URL)
    }

    //@ts-expect-error
    sql = global.sql
  }
}

export { sql }
