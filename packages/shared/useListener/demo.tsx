import { useListener } from '@reaxuse/shared'
import { useState } from 'react'

function createHook() {
  const fns = new Set<(value: string) => void>()
  return {
    onChange: (fn: (value: string) => void) => {
      fns.add(fn)
      return {
        off: () => fns.delete(fn),
      }
    },
    trigger: (value: string) => {
      fns.forEach(fn => fn(value))
    },
  }
}

export default function Demo() {
  const [hook] = useState(createHook)
  const [events, setEvents] = useState<string[]>([])

  useListener(hook.onChange, (value) => {
    setEvents(prev => [...prev, value])
  })

  return (
    <div>
      <p>
        Listeners registered and cleaned up automatically by
        <code>useListener</code>
        .
      </p>
      <button type="button" onClick={() => hook.trigger('ping')}>
        Trigger event
      </button>
      <ul>
        {events.map((event, index) => (
          <li key={index}>{event}</li>
        ))}
      </ul>
    </div>
  )
}
