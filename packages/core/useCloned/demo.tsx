import { useCloned } from '@reaxuse/core'
import { useState } from 'react'

const initialTemplate = { fruit: 'banana', drink: 'water' }

export default function UseClonedDemo() {
  // `source` accepts any React `State<T>`: a plain value, a getter
  // (`() => value`), a ref (`{ current }`), a `[value, setter]` tuple, or a
  // `{ value, onChange }` pair. This demo uses the tuple form.
  const [template, setTemplate] = useState(initialTemplate)
  const [cloned, setCloned, { isModified, sync }] = useCloned([template, setTemplate])

  // edits go through `setCloned` with an immutable functional update — no
  // in-place mutation and no forced re-render
  const edit = (patch: Partial<typeof initialTemplate>) => {
    setCloned(prev => ({ ...prev, ...patch }))
  }

  return (
    <div>
      <p>
        <input
          type="text"
          value={cloned.fruit}
          onChange={event => edit({ fruit: event.target.value })}
        />
        {' '}
        <input
          type="text"
          value={cloned.drink}
          onChange={event => edit({ drink: event.target.value })}
        />
        {' '}
        <button onClick={() => sync()} disabled={!isModified}>
          reset
        </button>
        {' '}
        <button onClick={() => setTemplate({ fruit: 'apple', drink: 'tea' })}>
          reload source
        </button>
      </p>
      <p>
        modified:
        {' '}
        <strong>{isModified ? 'true' : 'false'}</strong>
      </p>
    </div>
  )
}
