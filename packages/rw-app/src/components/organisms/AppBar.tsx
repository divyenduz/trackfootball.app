'use client'

import React, { useState } from 'react'
import { match } from 'ts-pattern'

import Logo from '@/components/atoms/brand/core/Logo'
import { LoginButton } from '@/components/atoms/LoginButton'
import { Photo } from '@/components/atoms/Photo'
import type { User } from '@trackfootball/postgres'

interface Props {
  user: User | null
  pageName: string
}

export const AppBar: React.FC<Props> = ({
  pageName = 'TrackFootball',
  user,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-3 py-3">
        <div className="flex items-center justify-between">
          <a href="/home" className="flex items-center gap-2 cursor-pointer">
            <Logo size={'xs'} />
            <h5 className="text-gray-900 hidden md:block text-xl font-medium">
              {pageName}
            </h5>
          </a>

          <div className="flex items-center gap-2">
            {match(user)
              .with(null, () => {
                return (
                <LoginButton />
                )
              })
              .otherwise((user) => {
                return (
                  <>
                    <a href={`/dashboard`}>
                      <button>Dashboard</button>
                    </a>
                    <div className="relative">
                      <button
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={(event) => {
                          setAnchorEl(event.currentTarget)
                        }}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Photo photo={user?.picture}></Photo>
                      </button>
                      {open && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setAnchorEl(null)}
                          />
                          <div
                            id="menu-appbar"
                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20"
                          >
                            <div className="py-1">
                              <a
                                href={`/athlete/${user?.id}`}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setAnchorEl(null)}
                              >
                                <span className="mr-3">👤</span>
                                Profile
                              </a>

                              <hr className="my-1 border-gray-200" />

                              <a
                                href="/api/auth/sign-out"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setAnchorEl(null)}
                              >
                                <span className="mr-3">😵</span>
                                Logout
                              </a>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )
              })}
          </div>
        </div>
      </div>
    </header>
  )
}
