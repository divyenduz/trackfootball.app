import { FunctionComponent } from 'react'
import { match } from 'ts-pattern'

interface Props {
  children: React.ReactNode
  id?: string
  className?: string
  direction?: 'horizontal' | 'vertical'
}

export const Space: FunctionComponent<Props> = ({
  children,
  id,
  direction,
  className,
}) => {
  const flexDirection = match(direction)
    .with('horizontal', () => 'flex-row')
    .with('vertical', () => 'flex-column')
    .otherwise(() => 'flex-row')
  return (
    <div
      id={id || 'id'}
      className={`flex flex-wrap ${flexDirection} gap-2 items-center justify-initial ${className}`}
    >
      {children}
    </div>
  )
}
