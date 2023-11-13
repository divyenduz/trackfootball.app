import { useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { match } from 'ts-pattern'

import Layout from '../layouts/Layout'

export default function Open() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Layout>
      <iframe
        src="https://metabase.zoid.dev/public/dashboard/fcf41055-6590-483a-8930-1251ad44dab6"
        width={'100%'}
        height={match(isMobile)
          .with(true, () => 4300)
          .with(false, () => 2950)
          .exhaustive()}
      ></iframe>
    </Layout>
  )
}
