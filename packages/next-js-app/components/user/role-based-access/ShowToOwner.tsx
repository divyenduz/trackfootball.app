'use client'

import { useFlags } from 'launchdarkly-react-client-sdk'
import React from 'react'
import { match } from 'ts-pattern'

import { useUser } from '../../context/UserContext'

interface ShowToOwnerProps {
  children: React.ReactNode
  ownerId: number
  userId: number
  className?: string
}

export const ShowToOwner: React.FC<ShowToOwnerProps> = ({
  children,
  ownerId,
  userId,
  className = '',
}) => {
  const { isLoading, user, error } = useUser()
  const flags = useFlags()

  if (isLoading) {
    return <></>
  }

  if (Boolean(error)) {
    return <></>
  }

  if (ownerId === userId) {
    return (
      <span
        className={className}
        style={{
          border: match(flags.showToAdmin)
            .with(true, () => `dashed 1px blue`)
            .otherwise(() => ``),
        }}
      >
        {children}
      </span>
    )
  } else if (flags.showToAdmin) {
    return (
      <span className={className} style={{ border: 'dashed 1px red' }}>
        {children}
      </span>
    )
  } else {
    console.log('Not owner or admin!')
    return <></>
  }
}

export default ShowToOwner
