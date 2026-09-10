import { syncState } from '@reaxuse/shared'
import { useState } from 'react'

export default function SyncStateDemo() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')

  syncState([a, setA], [b, setB])

  return (
    <div>
      <input
        value={a}
        type="text"
        placeholder="A"
        onChange={e => setA(e.target.value)}
      />
      <input
        value={b}
        type="text"
        placeholder="B"
        onChange={e => setB(e.target.value)}
      />
    </div>
  )
}
