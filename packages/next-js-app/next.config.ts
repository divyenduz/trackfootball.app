import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: 's.gravatar.com' },
      { hostname: 'pbs.twimg.com' },
      { hostname: 'trackfootball-public.s3.ap-southeast-1.amazonaws.com' },
      { hostname: 'picsum.photos' },
    ],
  },
  transpilePackages: ['@trackfootball/*'],
}

export default config
