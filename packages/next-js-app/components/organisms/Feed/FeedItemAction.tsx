"use client"

import React from 'react'

import { Space } from '../../../components/atoms/Space'
import { Button } from '../../atoms/Button'
import { deletePost } from 'app/actions/deletePost'
import { useRouter } from 'next/navigation'

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
            const formData = new FormData()
            formData.append('postId', postId.toString())
            const r = await deletePost(formData)
            router.replace('/dashboard')
          } catch (e) {
            console.error(e)
            alert(
              `Something went wrong, please contact singh@trackfootball.app` +
              e
            )
          }
        }}
      >
        🗑️
      </Button>
    </Space>
  )
}
