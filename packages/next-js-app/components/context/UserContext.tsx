import type { User } from '@prisma/client'
import React, { useContext } from 'react'

const UserContext = React.createContext<{
  isLoading: boolean
  user: User | null
  error: Error | null
}>({
  isLoading: false,
  user: null,
  error: null,
})

function useUser() {
  return useContext(UserContext)
}

export default UserContext
export { UserContext, useUser }
