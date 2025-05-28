'use client'

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { assignField } from 'app/actions/assignField'
import { getContenderFieldsAction } from 'app/actions/getContenderFields'
import type { FieldContender } from '@trackfootball/service/getContenderFields'
import React, { useEffect, useState } from 'react'

import type { AwaitedPost } from './ActivityItem'

interface FieldSelectorProps {
  post: AwaitedPost
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({ post }) => {
  const [contenders, setContenders] = useState<FieldContender[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<number>(post.fieldId || 0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadContenders() {
      try {
        const fields = await getContenderFieldsAction(post.id)
        setContenders(fields)
      } catch (error) {
        console.error('Failed to load contender fields:', error)
      } finally {
        setLoading(false)
      }
    }
    loadContenders()
  }, [post.id])

  const handleFieldChange = async (fieldId: number) => {
    if (fieldId === 0) return
    
    setSelectedFieldId(fieldId)
    
    try {
      const result = await assignField(post.id, fieldId)
      if (!result.success) {
        console.error('Failed to assign field:', result.error)
        alert('Failed to assign field')
      }
    } catch (error) {
      console.error('Error assigning field:', error)
      alert('Error assigning field')
    }
  }

  if (loading) {
    return (
      <div className="text-xs text-gray-500">Loading fields...</div>
    )
  }

  if (contenders.length === 0) {
    return (
      <div className="text-xs text-gray-500">No matching fields found</div>
    )
  }

  return (
    <FormControl size="small" className="min-w-[200px]">
      <InputLabel id="field-selector-label" className="text-xs">
        Select Field
      </InputLabel>
      <Select
        labelId="field-selector-label"
        value={selectedFieldId}
        label="Select Field"
        onChange={(e) => handleFieldChange(Number(e.target.value))}
        className="text-xs"
      >
        <MenuItem value={0} className="text-xs">
          <em>No field assigned</em>
        </MenuItem>
        {contenders.map((contender) => (
          <MenuItem 
            key={contender.field.id} 
            value={contender.field.id}
            className="text-xs"
          >
            {contender.field.name} ({contender.field.usage}) - {contender.percentageAreaCovered}% coverage
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}