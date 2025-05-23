'use client'

import React from 'react'

interface ShowToOwnerProps {
  children: React.ReactNode
  ownerId: number
  userId?: number
  className?: string
}

export const ShowToOwner: React.FC<ShowToOwnerProps> = ({
  children,
  ownerId,
  userId,
  className = '',
}) => {
  const isOwner = ownerId === userId

  if (isOwner) {
    return <span className={className}>{children}</span>
  } else {
    return <></>
  }
}

export default ShowToOwner
