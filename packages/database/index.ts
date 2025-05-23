import postgres from 'postgres'

export * from '@prisma/client'
export * from './repository/post'
export * from './repository/field'
export * from './repository/stats'
export * from './repository/user'
export * from './repository/currentUser'
export * from './repository/stravaWebhookEvent'
export * from './repository/socialLogin'

const sql = postgres(Bun.env.DATABASE_URL)
export { sql }
