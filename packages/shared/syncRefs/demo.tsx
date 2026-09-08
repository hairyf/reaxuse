import { syncRefs } from '@reaxuse/shared'
import { useState } from 'react'

export default function SyncRefsDemo() {
  const [source, setSource] = useState('')
  const [target1, setTarget1] = useState('')
  const [target2, setTarget2] = useState('')

  // ref-like bridges onto the state so synced values re-render the inputs
  const sourceRef = {
    get current() {
      return source
    },
    set current(value: string) {
      setSource(value)
    },
  }
  const target1Ref = {
    get current() {
      return target1
    },
    set current(value: string) {
      setTarget1(value)
    },
  }
  const target2Ref = {
    get current() {
      return target2
    },
    set current(value: string) {
      setTarget2(value)
    },
  }

  syncRefs(sourceRef, [target1Ref, target2Ref])

  return (
    <div>
      <input
        value={source}
        type="text"
        placeholder="Source"
        onChange={e => setSource(e.target.value)}
      />
      <input
        value={target1}
        type="text"
        placeholder="Target1"
        onChange={e => setTarget1(e.target.value)}
      />
      <input
        value={target2}
        type="text"
        placeholder="Target2"
        onChange={e => setTarget2(e.target.value)}
      />
    </div>
  )
}
