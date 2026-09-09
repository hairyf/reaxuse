import { until, useCounter } from '@reaxuse/shared'
import { useEffect, useRef, useState } from 'react'

export default function UntilDemo() {
  const { count, inc, dec } = useCounter()
  const [gotSeven, setGotSeven] = useState(false)

  // keep a live getter source for `until` (React has no reactive refs — the
  // getter re-reads the latest count on every poll)
  const countRef = useRef(count)
  countRef.current = count

  useEffect(() => {
    if (gotSeven)
      return
    let cancelled = false
    void until(() => countRef.current).toBe(7).then(() => {
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
