import { useWatchOnce } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchOnceDemo() {
  const [count, setCount] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  useWatchOnce(count, (value, oldValue) => {
    setLogs(prev => [...prev, `${oldValue} → ${value}`])
  })

  return (
    <div>
      <p>
        count:
        {' '}
        <strong>{count}</strong>
      </p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <p>
        watched changes (only the first one is kept):
        {' '}
        {logs.length > 0 ? logs.join(', ') : 'none yet'}
      </p>
    </div>
  )
}
