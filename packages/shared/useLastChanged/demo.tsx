import { useLastChanged } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseLastChangedDemo() {
  const [input, setInput] = useState('')
  const lastChanged = useLastChanged(input, { initialValue: Date.now() - 1000 * 60 * 5 })

  return (
    <div>
      <input
        value={input}
        type="text"
        placeholder="Type anything..."
        onChange={e => setInput(e.target.value)}
      />
      <p>
        Last changed:
        {' '}
        <strong>{lastChanged}</strong>
      </p>
    </div>
  )
}
