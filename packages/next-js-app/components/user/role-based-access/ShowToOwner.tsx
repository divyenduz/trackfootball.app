'use client'

import React from 'react'
import { match } from 'ts-pattern'

interface ShowToOwnerProps {
  children: React.ReactNode
  ownerId: number
  userId: number
  userIsAdmin: boolean
  className?: string
}

export const ShowToOwner: React.FC<ShowToOwnerProps> = ({
  children,
  ownerId,
  userId,
  userIsAdmin,
  className = '',
}) => {
  const isOwner = ownerId === userId
  console.log({ ownerId, userId })

  if (ownerId === userId) {
    return (
      <span
        className={className}
        style={{
          border: match(userIsAdmin)
            .with(true, () => `dashed 1px blue`)
            .otherwise(() => ``),
        }}
      >
        {children}
      </span>
    )
  } else if (userIsAdmin) {
    return (
      <span className={className} style={{ border: 'dashed 1px red' }}>
        {children}
      </span>
    )
  } else {
    return <></>
  }
}

export default ShowToOwner
