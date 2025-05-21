/** @type {import('next').NextConfig} */

const config = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'lh3.googleusercontent.com',
      's.gravatar.com',
      'pbs.twimg.com',
      'trackfootball-public.s3.ap-southeast-1.amazonaws.com',
      'picsum.photos'
    ],
  },
  transpilePackages: ['@trackfootball/*', 'mapbox-gl'],
}

module.exports = config
