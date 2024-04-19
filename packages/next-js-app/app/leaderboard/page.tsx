'use client'

import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Tab } from '@mui/material'
import React, { useRef, useState } from 'react'

export default function LeaderboardPage() {
  const [tab, setTab] = React.useState('2')

  const ref1 = useRef<HTMLIFrameElement>(null)
  const [height1, setHeight1] = useState('550px')

  const ref2 = useRef<HTMLIFrameElement>(null)
  const [height2, setHeight2] = useState('550px')

  // Note: last month and this month questions are embedded directly as metabase dashboard doesn't support tabs yet.
  return (
    <div className="w-full max-w-4xl">
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
              ref={ref1}
              onLoad={() => {
                if (ref1.current) {
                  setHeight1(
                    ref1.current.contentWindow?.document.body.scrollHeight +
                      'px'
                  )
                }
              }}
              src="https://metabase.zoid.dev/public/question/5e1161ea-14ac-416e-ab0a-1c8e66a0b56d"
              width={'100%'}
              height={height1}
            ></iframe>
          </TabPanel>
          <TabPanel value="2" className="w-full">
            <iframe
              ref={ref2}
              onLoad={() => {
                if (ref2.current) {
                  setHeight2(
                    ref2.current.contentWindow?.document.body.scrollHeight +
                      'px'
                  )
                }
              }}
              src="https://metabase.zoid.dev/public/question/852aeffe-18a2-477f-9100-4011e5e48db6"
              width={'100%'}
              height={height2}
            ></iframe>
          </TabPanel>
        </TabContext>
      </div>
    </div>
  )
}
