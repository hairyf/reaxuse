import { useWatchDebounced } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchDebouncedDemo() {
  const [input, setInput] = useState('')
  const [updated, setUpdated] = useState(0)

  useWatchDebounced(input, () => setUpdated(count => count + 1), { debounce: 1000, maxWait: 5000 })

  return (
    <div>
      <input
        type="text"
        value={input}
        placeholder="Try to type anything..."
        onChange={event => setInput(event.target.value)}
      />
      <p>
        Delay is set to 1000ms and maxWait is set to 5000ms for this demo.
      </p>
      <p>
        Input:
        {' '}
        <strong>{input}</strong>
      </p>
      <p>
        Times Updated:
        {' '}
        {updated}
      </p>
    </div>
  )
}
