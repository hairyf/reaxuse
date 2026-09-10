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
    // NOTE: `until` has no abort API — its 50ms poll keeps running until the
    // condition holds (count reaches 7) even if this component unmounts; the
    // `cancelled` flag only prevents the state write after unmount.
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
