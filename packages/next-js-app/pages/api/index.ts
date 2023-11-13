import { sql } from '@trackfootball/database'
import { spawnSync } from 'child_process'
import dotenv from 'dotenv'
import mls from 'multilines'
import { NextApiRequest, NextApiResponse } from 'next'

import pjson from '../../../../package.json'

dotenv.config()

export const indexHandler = async (_: NextApiRequest, res: NextApiResponse) => {
  const releaseTag = pjson.version
  const platform = process.env.PLATFORM

  const gitStatus = spawnSync('git', ['show', '--summary'])
  type Count = { count: number }
  type CountResult = Count[]
  const userCount = await sql<CountResult>`SELECT COUNT(*) FROM "User"`
  const postCount = await sql<CountResult>`SELECT COUNT(*) FROM "Post"`

  res.status(200).send(
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
          .join('\n')
      )
      .join('\n')}
    | ==============================
    |
    | Database test (${userCount[0].count}, ${postCount[0].count})
    | Platform ${platform}`
  )
}

export default indexHandler
