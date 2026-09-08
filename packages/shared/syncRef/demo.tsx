import { syncRef } from '@reaxuse/shared'
import { useState } from 'react'

export default function SyncRefDemo() {
  const [a, setA] = useState('')
  const [b, setB] = useState('')

  // ref-like bridges onto the state so synced values re-render the inputs
  const aRef = {
    get current() {
      return a
    },
    set current(value: string) {
      setA(value)
    },
  }
  const bRef = {
    get current() {
      return b
    },
    set current(value: string) {
      setB(value)
    },
  }

  syncRef(aRef, bRef)

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
