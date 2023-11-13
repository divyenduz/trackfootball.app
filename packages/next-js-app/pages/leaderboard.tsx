import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Tab, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { match } from 'ts-pattern'

import Layout from '../layouts/Layout'

export default function LeaderboardPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [tab, setTab] = React.useState('2')

  // Note: last month and this month questions are embedded directly as metabase dashboard doesn't support tabs yet.
  return (
    <Layout>
      <div className="flex flex-col w-full">
        <TabContext value={tab}>
          <TabList
            onChange={(_, newValue) => {
              setTab(newValue)
            }}
            variant="fullWidth"
            indicatorColor="secondary"
            textColor="secondary"
            aria-label="icon label tabs example"
          >
            <Tab value="1" label="Last Month" />
            <Tab value="2" label="This Month" />
          </TabList>
          <TabPanel value="1" className="w-full">
            <iframe
              src="https://metabase.zoid.dev/public/question/5e1161ea-14ac-416e-ab0a-1c8e66a0b56d"
              width={'100%'}
              height={match(isMobile)
                .with(true, () => 450)
                .with(false, () => 550)
                .exhaustive()}
            ></iframe>
          </TabPanel>
          <TabPanel value="2" className="w-full">
            <iframe
              src="https://metabase.zoid.dev/public/question/852aeffe-18a2-477f-9100-4011e5e48db6"
              width={'100%'}
              height={match(isMobile)
                .with(true, () => 450)
                .with(false, () => 550)
                .exhaustive()}
            ></iframe>
          </TabPanel>
        </TabContext>
      </div>
    </Layout>
  )
}
