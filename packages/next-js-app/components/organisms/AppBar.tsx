import {
  Divider,
  Hidden,
  IconButton,
  ListItemIcon,
  AppBar as MaterialAppBar,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { match } from 'ts-pattern'

import Button from '../atoms/Button'
import { ConditionalDisplay } from '../atoms/ConditionalDisplay'
import Logo from '../atoms/brand/core/Logo'
import { useUser } from '../context/UserContext'

interface Props {
  pageName?: string
}

export const AppBar: React.FC<Props> = ({ pageName = 'TrackFootball' }) => {
  const { isLoading: _, error: __, user } = useUser()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  return (
    <div>
      <MaterialAppBar position="fixed" color="default">
        <Toolbar className="p-3">
          <Link
            legacyBehavior
            href={match(Boolean(user))
              .with(true, () => '/dashboard')
              .with(false, () => '/')
              .exhaustive()}
            passHref
          >
            <a>
              <div className="flex flex-row flex-wrap items-center justify-center flex-none gap-2 cursor-pointer">
                <Logo size={'xs'} />
                {/* @ts-ignore */}
                <Hidden mdDown>
                  <Typography
                    className="text-gray-900"
                    variant="h6"
                    component={'h5'}
                  >
                    {pageName}
                  </Typography>
                </Hidden>
              </div>
            </a>
          </Link>

          <div className="flex justify-end flex-1 ">
            {match(Boolean(user))
              .with(true, () => {
                return (
                  <>
                    <Link legacyBehavior href={`/leaderboard`} passHref>
                      <a>
                        <Button>Leaderboard</Button>
                      </a>
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
                      <ConditionalDisplay visible={Boolean(user?.picture)}>
                        <div className="rounded-full w-7 h-7">
                          <Image
                            alt="User's display picture"
                            width={30}
                            height={30}
                            className="object-cover rounded-full"
                            src={
                              user?.picture ||
                              'https://trackfootball-public.s3.ap-southeast-1.amazonaws.com/prod/user.svg'
                            }
                          ></Image>
                        </div>
                      </ConditionalDisplay>

                      <ConditionalDisplay visible={!Boolean(user?.picture)}>
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
                        <Link
                          legacyBehavior
                          href={`/athlete/[id]`}
                          as={`/athlete/${user?.id}`}
                          passHref
                        >
                          <a className="w-full text-rose-700">Profile</a>
                        </Link>
                      </MenuItem>

                      <Divider />

                      <MenuItem
                        onClick={() => {
                          setAnchorEl(null)
                        }}
                      >
                        <ListItemIcon>😵</ListItemIcon>
                        <Link legacyBehavior href="/api/auth/logout" passHref>
                          <a className="w-full">Logout</a>
                        </Link>
                      </MenuItem>
                    </Menu>
                  </>
                )
              })
              .with(false, () => {
                return (
                  <Link legacyBehavior href="/api/auth/login" passHref>
                    <a>
                      <Button variant="contained">Login</Button>
                    </a>
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
