import { until, useCounter } from '@reaxuse/shared'
import { useEffect, useRef, useState } from 'react'

export default function UntilDemo() {
  const { count, inc, dec } = useCounter()
  const [gotSeven, setGotSeven] = useState(false)

  // keep a fresh ref-like source for `until` (React has no reactive refs —
  // `until` polls `{ current }` until the condition holds)
  const countRef = useRef(count)
  countRef.current = count

  useEffect(() => {
    if (gotSeven)
      return
    let cancelled = false
    void until(countRef).toBe(7).then(() => {
      if (!cancelled)
        setGotSeven(true)
    })
    return () => {
      cancelled = true
    }
  }, [gotSeven])

  return (
    <div>
      <p>
        Count:
        {' '}
        {count}
      </p>
      <button onClick={() => inc()}>
        Increment
      </button>
      <button onClick={() => dec()}>
        Decrement
      </button>
      {gotSeven && (
        <p>You got 7!</p>
      )}
    </div>
  )
}
