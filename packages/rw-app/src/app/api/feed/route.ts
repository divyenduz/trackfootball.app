import { requestInfo } from 'rwsdk/worker'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')
  
  const feed = await requestInfo.ctx.repository.getFeed(
    cursor ? parseInt(cursor) : undefined
  )

  return Response.json(feed)
}
