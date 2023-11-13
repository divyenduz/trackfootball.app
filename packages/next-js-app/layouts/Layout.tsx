import { Hidden, Typography } from '@mui/material'
import { NoSsr } from '@mui/material'
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect } from 'react'

import Logo from '../components/atoms/brand/core/Logo'
import { UserContext } from '../components/context/UserContext'
import { AppBar } from '../components/organisms/AppBar'
import { trpc } from '../packages/utils/trpcReact'

interface Props {
  children: React.ReactNode
  pageName?: string
  pageTitle?: string
  fullWidth?: boolean
}

export const Layout: React.FC<Props> = ({
  children,
  pageName,
  pageTitle,
  fullWidth = false,
}) => {
  const me = trpc.useQuery(['app.me'])

  const ldClient = useLDClient()

  useEffect(() => {
    if (me.isLoading) {
      return
    }
    if (me.error) {
      console.error(me.error)
    }
    if (ldClient && me.data) {
      ldClient.identify(
        {
          kind: 'user',
          key: me.data.user.id.toString(),
          email: me.data.user.email,
          name: me.data.user.firstName + ' ' + me.data.user.lastName,
        },
        me.data.user.id.toString(),
        (error, flags) => {
          console.log("New context's flags available", error, flags)
        }
      )
    }
  }, [me])

  const flags = useFlags()

  if (flags.maintenanceMode) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>TrackFootball is in maintenance mode. We will be back shortly.</p>
      </div>
    )
  }

  return (
    <UserContext.Provider
      value={{
        isLoading: me.isFetching,
        user: me.data?.user || null,
        error: Boolean(me.error) ? new Error(me.error?.message) : null,
      }}
    >
      <Head>
        <title>
          {Boolean(pageTitle)
            ? pageTitle
            : 'TrackFootball | Track, Analyse and Improve | Democratizing Football Science'}
        </title>
      </Head>

      <div>
        <NoSsr>
          <AppBar pageName={pageName}></AppBar>
        </NoSsr>
      </div>

      <div className="flex items-center justify-center">
        <div
          className={`flex flex-col items-center justify-center w-full ${
            fullWidth ? '' : 'max-w-4xl'
          } mt-24`}
        >
          {children}
        </div>
      </div>

      <div className="p-5 bg-oynx">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-8 cursor-pointer ">
            <div className="flex items-center justify-center">
              <Logo size={'xs'} />
              {/* @ts-ignore */}
              <Hidden mdDown>
                <Typography
                  variant="h6"
                  component={'h5'}
                  style={{
                    color: '#fff',
                    fontWeight: 300,
                    position: 'relative',
                  }}
                >
                  TrackFootball
                </Typography>
              </Hidden>
            </div>
            <span className="flex items-center justify-center text-sm font-light text-center text-gray-300">
              Made for players looking to improve their games
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white underline dec">
            <Link legacyBehavior href="/privacy">
              <a target="_blank" className="text-gray-500">
                Privacy Policy
              </a>
            </Link>
            <Link legacyBehavior href="mailto:hello@trackfootball.app">
              <a target="_blank" className="text-gray-500">
                Contact Us
              </a>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center m-4">
            <Image
              width={100}
              height={50}
              alt="Compatible with Strava logo"
              src="/assets/strava/api_logo_cptblWith_strava_stack_white.svg"
            ></Image>
          </div>
        </div>
      </div>
    </UserContext.Provider>
  )
}

export default Layout
