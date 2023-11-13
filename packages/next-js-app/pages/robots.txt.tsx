import { NextApiResponse } from 'next'
import React from 'react'

const getRobots = () => `User-agent: *
Disallow: /_next/static/
Disallow: */raw
`

class Robots extends React.Component {
  public static async getInitialProps({ res }: { res: NextApiResponse }) {
    res.setHeader('Content-Type', 'text/plain')
    res.write(getRobots())
    res.end()
  }
}

export default Robots
