import router from 'next/router'
import React, { useEffect } from 'react'

import Layout from '../layouts/Layout'
import { trpc } from '../packages/utils/trpcReact'

export default function Login() {
  const meQuery = trpc.useQuery(['app.me'])

  useEffect(() => {
    if (meQuery.isError) {
      router.replace('/home')
    }
    if (meQuery.isLoading) {
      return
    }

    const user = meQuery.data?.user

    if (user) {
      router.replace('/dashboard')
    } else {
      router.replace('/home')
    }
  }, [meQuery.isLoading, meQuery.isError])

  return (
    <Layout pageTitle="Landing | TrackFootball" fullWidth={true}>
      Loading...
    </Layout>
  )
}
