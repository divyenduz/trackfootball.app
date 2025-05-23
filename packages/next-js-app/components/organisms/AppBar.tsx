'use client'

import {
  Divider,
  IconButton,
  ListItemIcon,
  AppBar as MaterialAppBar,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { AwaitedUser } from 'app/layout'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { match } from 'ts-pattern'

import Button from '../atoms/Button'
import { ConditionalDisplay } from '../atoms/ConditionalDisplay'
import Logo from '../atoms/brand/core/Logo'

interface Props {
  user: AwaitedUser
  pageName: string
}

export const AppBar: React.FC<Props> = ({
  pageName = 'TrackFootball',
  user,
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  return (
    <div>
      <MaterialAppBar position="fixed" color="default">
        <Toolbar className="p-3">
          <Link href="/home">
            <div className="flex flex-row flex-wrap items-center justify-center flex-none gap-2 cursor-pointer">
              <Logo size={'xs'} />
              <Typography
                className="text-gray-900 hidden md:block"
                variant="h6"
                component={'h5'}
              >
                {pageName}
              </Typography>
            </div>
          </Link>

          <div className="flex justify-end flex-1">
            {match(Boolean(user))
              .with(true, () => {
                return (
                  <>
                    <Link href={`/dashboard`}>
                      <Button>Dashboard</Button>
                    </Link>
                    <IconButton
                      aria-label="account of current user"
                      aria-controls="menu-appbar"
                      aria-haspopup="true"
                      onClick={(event) => {
                        //@ts-expect-error
                        setAnchorEl(event.currentTarget)
                      }}
                      color="inherit"
                      size="large"
                    >
                      <ConditionalDisplay visible={Boolean(user.picture)}>
                        <div className="rounded-full w-7 h-7">
                          {user.picture ? (
                            <Image
                              alt="User's display picture"
                              width={30}
                              height={30}
                              className="object-cover rounded-full"
                              src={user.picture}
                            ></Image>
                          ) : null}
                        </div>
                      </ConditionalDisplay>

                      <ConditionalDisplay visible={!Boolean(user.picture)}>
                        👤
                      </ConditionalDisplay>
                    </IconButton>
                    <Menu
                      id="menu-appbar"
                      className="menu-appbar"
                      anchorEl={anchorEl}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      keepMounted
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      open={open}
                      onClose={() => {
                        setAnchorEl(null)
                      }}
                      PaperProps={{
                        elevation: 2,
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          setAnchorEl(null)
                        }}
                      >
                        <ListItemIcon>👤</ListItemIcon>
                        <Link href={`/athlete/[id]`} as={`/athlete/${user.id}`}>
                          <span className="w-full">Profile</span>
                        </Link>
                      </MenuItem>

                      <Divider />

                      <MenuItem
                        onClick={() => {
                          setAnchorEl(null)
                        }}
                      >
                        <ListItemIcon>😵</ListItemIcon>
                        <a className="w-full" href="/api/auth/logout">
                          Logout
                        </a>
                      </MenuItem>
                    </Menu>
                  </>
                )
              })
              .with(false, () => {
                return (
                  <Link href="/api/auth/login">
                    <Button variant="contained">Login</Button>
                  </Link>
                )
              })
              .exhaustive()}
          </div>
        </Toolbar>
      </MaterialAppBar>
    </div>
  )
}
