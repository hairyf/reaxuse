import { useWatchAtMost } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchAtMostDemo() {
  const [count, setCount] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const { count: fired, stop } = useWatchAtMost(count, (value, oldValue) => {
    setLogs(prev => [...prev, `${oldValue} → ${value}`])
  }, { count: 3 })

  return (
    <div>
      <p>
        count:
        {' '}
        <strong>{count}</strong>
      </p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => stop()}>stop</button>
      <p>
        fired:
        {' '}
        {fired}
        {' / '}
        3
      </p>
      <p>
        watched changes:
        {' '}
        {logs.length > 0 ? logs.join(', ') : 'none yet'}
      </p>
    </div>
  )
}
