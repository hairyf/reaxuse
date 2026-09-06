import { debounceFilter, useWatchWithFilter } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchWithFilterDemo() {
  const [input, setInput] = useState('')
  const [updated, setUpdated] = useState(0)

  useWatchWithFilter(input, () => setUpdated(count => count + 1), { eventFilter: debounceFilter(1000) })

  return (
    <div>
      <input
        type="text"
        value={input}
        placeholder="Try to type anything..."
        onChange={event => setInput(event.target.value)}
      />
      <p>
        Debounce is set to 1000ms for this demo.
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
