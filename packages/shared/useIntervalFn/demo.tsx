import { useIntervalFn } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseIntervalFnDemo() {
  const [count, setCount] = useState(0)
  const [intervalMs, setIntervalMs] = useState(1000)
  const { isActive, pause, resume } = useIntervalFn(
    () => setCount(count => count + 1),
    intervalMs,
  )

  return (
    <div>
      <p>
        {'Ticked '}
        {count}
        {' times'}
      </p>
      <p>
        interval:
        <input
          type="number"
          value={intervalMs}
          onChange={event => setIntervalMs(Number(event.target.value))}
        />
      </p>
      <button onClick={isActive ? pause : resume}>
        {isActive ? 'Pause' : 'Resume'}
      </button>
    </div>
  )
}
