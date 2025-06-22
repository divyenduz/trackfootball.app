'use client'

import { useState, useTransition } from 'react'

export function Login() {
  const [username, setUsername] = useState('')
  const [result, setResult] = useState('')
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      {result && <div>{result}</div>}
    </>
  )
}
