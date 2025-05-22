import { spawnSync } from 'child_process'
import dotenv from 'dotenv'
import mls from 'multilines'

import pjson from '../../../../package.json'
import { sql } from 'bun'

export const dynamic = 'force-dynamic'

dotenv.config()

export async function GET() {
  const releaseTag = pjson.version
  const platform = process.env.PLATFORM

  const gitStatus = spawnSync('git', ['show', '--summary'])
  type CountResult = { count: number }[]
  const userCount: CountResult = await sql`SELECT COUNT(*) FROM "User"`
  const postCount: CountResult = await sql`SELECT COUNT(*) FROM "Post"`

  return new Response(
    mls`
    | Welcome to trackfootball.app API.
    |
    | TrackFootball version ${releaseTag}
    | -- Description:
    |
    | ==============================
    | ${gitStatus.output
      .filter((b) => Boolean(b))
      .map((b) =>
        b
          ?.toString()
          .split('\n')
          .filter((s) => !s.startsWith('Author'))
          .join('\n'),
      )
      .join('\n')}
    | ==============================
    |
    | Database test (${userCount[0].count}, ${postCount[0].count})
    | Platform ${platform}`,
    {
      status: 200,
    },
  )
}
