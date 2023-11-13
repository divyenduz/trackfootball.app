/// <reference types="next" />
/// <reference types="next/types/global" />

declare namespace NodeJS {
  // Merge the existing `ProcessEnv` definition with ours
  // https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces
  export interface ProcessEnv {
    PLATFORM: 'LOCAL' | 'RAILWAY' | 'FLYCTL' | 'SSD_NODES'
    NODE_ENV: 'production' | 'development' | 'test'
    NEXT_TELEMETRY_DISABLED: string
    COOKIE_DOMAIN: string
    BACKEND_API: string
    MAPBOX_API_TOKEN: string
    DATABASE_URL: string
    STRAVA_CLIENT_ID: string
    STRAVA_CLIENT_SECRET: string
    HOMEPAGE_URL: string
    STAGE: string
    AWS_ACCESS_KEY_ID_MYAPP: string
    NO_COLOR: string
    AUTH0_SECRET: string
    AUTH0_BASE_URL: string
    AUTH0_ISSUER_BASE_URL: string
    AUTH0_CLIENT_ID: string
    AUTH0_CLIENT_SECRET: string
    DISCORD_TRACKFOOTBALL_APPLICATION_EVENTS_WEBHOOK: string
  }
}
