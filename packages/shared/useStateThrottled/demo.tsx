import { useStateThrottled } from '@reaxuse/shared'
import { useEffect, useRef, useState } from 'react'

export default function UseStateThrottledDemo() {
  const [trailing, setTrailing] = useState(true)
  const [leading, setLeading] = useState(false)
  const [input, setInput, throttled] = useStateThrottled('', 1000, trailing, leading)
  const [updated, setUpdated] = useState(0)

  // mirror upstream `watch(throttled, () => { updated.value += 1 })`
  const prevThrottledRef = useRef(throttled)
  useEffect(() => {
    if (throttled !== prevThrottledRef.current) {
      prevThrottledRef.current = throttled
      setUpdated(count => count + 1)
    }
  }, [throttled])

  return (
    <div>
      <input
        type="text"
        value={input}
        placeholder="Try to type anything..."
        onChange={event => setInput(event.target.value)}
      />
      <p>
        Delay is set to 1000ms for this demo.
      </p>
      <p>
        Throttled:
        {' '}
        <strong>{throttled}</strong>
      </p>
      <p>
        Times Updated:
        {' '}
        {updated}
      </p>
      <p>
        <label>
          <input
            type="checkbox"
            checked={trailing}
            onChange={event => setTrailing(event.target.checked)}
          />
          {' '}
          Trailing
        </label>
        {' '}
        <label>
          <input
            type="checkbox"
            checked={leading}
            onChange={event => setLeading(event.target.checked)}
          />
          {' '}
          Leading
        </label>
      </p>
    </div>
  )
}
