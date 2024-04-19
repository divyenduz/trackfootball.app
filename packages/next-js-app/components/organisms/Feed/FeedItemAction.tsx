'use client'

import { deletePost } from 'app/actions/deletePost'
import { useRouter } from 'next/navigation'
import React from 'react'

import { Space } from '../../../components/atoms/Space'
import { Button } from '../../atoms/Button'

interface FeedItemActionProps {
  postId: number
}

export const FeedItemAction = ({ postId }: FeedItemActionProps) => {
  const router = useRouter()
  return (
    <Space direction="horizontal">
      <Button
        variant="outlined"
        onClick={async () => {
          const rc = confirm(
            'Are you sure that you want to delete this activity? This cannot be undone.'
          )
          if (!rc) {
            return
          }
          try {
            const r = await deletePost(postId)
            router.replace('/dashboard')
          } catch (e) {
            console.error(e)
            alert(
              `Something went wrong, please contact singh@trackfootball.app` + e
            )
          }
        }}
      >
        🗑️
      </Button>
    </Space>
  )
}
