import { useWatch } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchDemo() {
  const [count, setCount] = useState(0)
  const [log, setLog] = useState<string[]>([])

  useWatch(count, (value, oldValue) => {
    setLog(prev => [...prev, `${oldValue} → ${value}`])
  })

  return (
    <div>
      <p>
        count:
        {' '}
        <strong>{count}</strong>
      </p>
      <button onClick={() => setCount(c => c + 1)}>increment</button>
      <button onClick={() => setCount(c => c - 1)}>decrement</button>
      <ul>
        {log.map((entry, i) => <li key={i}>{entry}</li>)}
      </ul>
    </div>
  )
}
