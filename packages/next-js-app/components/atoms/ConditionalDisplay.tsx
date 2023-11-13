import React from 'react'
import { match } from 'ts-pattern'

interface Props {
  children: React.ReactNode
  visible: boolean
}

export const ConditionalDisplay: React.FC<Props> = ({ children, visible }) => {
  return match(visible)
    .with(true, () => <>{children}</>)
    .with(false, () => null)
    .exhaustive()
}
