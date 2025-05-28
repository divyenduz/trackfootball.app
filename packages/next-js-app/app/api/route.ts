import { spawnSync } from 'child_process'
import dotenv from 'dotenv'
import mls from 'multilines'

import pjson from '../../../../package.json'
import { repository } from '@trackfootball/database'

export const dynamic = 'force-dynamic'

dotenv.config()

export async function GET() {
  const releaseTag = pjson.version
  const platform = process.env.PLATFORM

  const gitStatus = spawnSync('git', ['show', '--summary'])
  const userCount = await repository.getUserCount()
  const postCount = await repository.getPostCount()

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
    | Database test (${userCount}, ${postCount})
    | Platform ${platform}`,
    {
      status: 200,
    },
  )
}
