'use client'

const BaseError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) => {
  console.log({
    error,
    reset,
  })
  return <>Something went wrong: {error.message}</>
}

export default BaseError
