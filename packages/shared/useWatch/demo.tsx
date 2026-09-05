import { useWatch } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchDemo() {
  const [count, setCount] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  useWatch(count, (value, oldValue) => {
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
        watched changes:
        {' '}
        {logs.length > 0 ? logs.join(', ') : 'none yet'}
      </p>
    </div>
  )
}
