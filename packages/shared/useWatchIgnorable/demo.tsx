import { useWatchIgnorable } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchIgnorableDemo() {
  const [logs, setLogs] = useState<string[]>([])
  const [value, setValue, { ignoreUpdates }] = useWatchIgnorable(0, v =>
    setLogs(prev => [...prev, `Changed to "${v}"`]))

  return (
    <div>
      <p>
        value:
        {' '}
        <strong>{value}</strong>
      </p>
      <button onClick={() => setValue(v => v + 1)}>Update</button>
      <button onClick={() => ignoreUpdates(() => setValue(v => v + 1))}>Ignored Update</button>
      <button
        onClick={() => {
          // ignore the reset so it does not append a log entry
          ignoreUpdates(() => setValue(0))
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
