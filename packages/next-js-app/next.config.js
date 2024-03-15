/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const config = {
  // env is Required for getStaticProps + next build https://github.com/vercel/next.js/discussions/11493#discussioncomment-14606
  env: {},
  publicRuntimeConfig: {
    // Will be available on both server and client
    BackendApiUrl: process.env.BACKEND_API || 'https://trackfootball.app/api',
  },
  serverRuntimeConfig: {
    BackendApiUrl: process.env.BACKEND_API,
  },
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
