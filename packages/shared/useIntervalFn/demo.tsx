import { useIntervalFn } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseIntervalFnDemo() {
  const [count, setCount] = useState(0)
  const { isActive, pause, resume } = useIntervalFn(
    () => setCount(count => count + 1),
    1000,
  )

  return (
    <div>
      <p>
        {'Ticked '}
        {count}
        {' times'}
      </p>
      <button onClick={isActive ? pause : resume}>
        {isActive ? 'Pause' : 'Resume'}
      </button>
    </div>
  )
}
