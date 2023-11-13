import React from 'react'

import { Space } from '../../../components/atoms/Space'
import { Button } from '../../atoms/Button'

interface FeedItemActionProps {
  onDelete: any
}

export const FeedItemAction = ({ onDelete }: FeedItemActionProps) => {
  return (
    <Space direction="horizontal">
      <Button
        variant="outlined"
        onClick={() => {
          onDelete()
        }}
      >
        🗑️
      </Button>
    </Space>
  )
}
