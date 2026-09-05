import { useWatchIgnorable } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchIgnorableDemo() {
  const [logs, setLogs] = useState<string[]>([])
  const [source, setSource] = useState(0)
  const { ignoreUpdates } = useWatchIgnorable(source, v =>
    setLogs(prev => [...prev, `Changed to "${v}"`]))

  return (
    <div>
      <p>
        value:
        {' '}
        <strong>{source}</strong>
      </p>
      <button onClick={() => setSource(v => v + 1)}>Update</button>
      <button onClick={() => ignoreUpdates(() => setSource(v => v + 1))}>Ignored Update</button>
      <button
        onClick={() => {
          // ignore the reset so it does not append a log entry
          ignoreUpdates(() => setSource(0))
          setLogs([])
        }}
      >
        Reset
      </button>
      <p>
        watched changes:
        {' '}
        {logs.length > 0 ? logs.join(' | ') : 'none yet'}
      </p>
    </div>
  )
}
