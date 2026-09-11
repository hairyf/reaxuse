import { useMount } from '@reause/shared'
import { useState } from 'react'

export default function UseMountDemo() {
  const [message, setMessage] = useState('waiting')
  useMount(() => setMessage('mounted'))

  return (
    <p>
      status:
      {' '}
      <strong>{message}</strong>
    </p>
  )
}
