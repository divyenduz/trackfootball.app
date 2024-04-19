/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const config = {
  images: {
    domains: [
      'lh3.googleusercontent.com',
      's.gravatar.com',
      'pbs.twimg.com',
      'trackfootball-public.s3.ap-southeast-1.amazonaws.com',
      'picsum.photos'
    ],
  },
  transpilePackages: ['@trackfootball/*'],
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = withBundleAnalyzer(config)
