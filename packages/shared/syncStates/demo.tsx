import { syncStates } from '@reause/shared'
import { useState } from 'react'

export default function SyncStatesDemo() {
  const [source, setSource] = useState('')
  const [target1, setTarget1] = useState('')
  const [target2, setTarget2] = useState('')

  // the source is a plain value — pass the state value (or `ref.current`)
  syncStates(source, [[target1, setTarget1], [target2, setTarget2]])

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
