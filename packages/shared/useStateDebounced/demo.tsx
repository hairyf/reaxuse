import { useStateDebounced } from '@reause/shared'
import { useEffect, useRef, useState } from 'react'

export default function UseStateDebouncedDemo() {
  const [input, setInput, debounced] = useStateDebounced('', 1000)
  const [updated, setUpdated] = useState(0)

  // count the debounced commits (upstream: `watch(debounced, ...)`)
  const previousDebouncedRef = useRef(debounced)
  useEffect(() => {
    if (previousDebouncedRef.current === debounced)
      return
    previousDebouncedRef.current = debounced
    setUpdated(count => count + 1)
  }, [debounced])

  return (
    <div>
      <input
        type="text"
        value={input}
        placeholder="Try to type anything..."
        onChange={event => setInput(event.target.value)}
      />
      <p>Delay is set to 1000ms for this demo.</p>
      <p>
        Debounced:
        {' '}
        <strong>{debounced}</strong>
      </p>
      <p>
        Times Updated:
        {' '}
        {updated}
      </p>
    </div>
  )
}
