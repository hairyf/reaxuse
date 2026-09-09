import { useCloned } from '@reaxuse/core'
import { useReducer, useState } from 'react'

const initialTemplate = { fruit: 'banana', drink: 'water' }

export default function UseClonedDemo() {
  // `source` accepts any React `State<T>`: a plain value, a getter
  // (`() => value`), a ref (`{ current }`), a `[value, setter]` tuple, or a
  // `{ value, onChange }` pair. This demo uses the tuple form.
  const [template, setTemplate] = useState(initialTemplate)
  const { cloned, isModified, sync } = useCloned([template, setTemplate])

  // `cloned` is plain state — editing it in place is picked up by the hook on
  // the next render (sets `isModified`), so a re-render is forced here
  const [, forceRender] = useReducer((count: number) => count + 1, 0)

  const edit = (patch: Partial<typeof initialTemplate>) => {
    Object.assign(cloned, patch)
    forceRender()
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
