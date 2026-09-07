import { useCloned } from '@reaxuse/core'
import { useReducer } from 'react'

const template = { fruit: 'banana', drink: 'water' }

export default function UseClonedDemo() {
  const { cloned, isModified, sync } = useCloned(template)

  // `cloned` is plain state — editing it in place is picked up by the hook on
  // the next render (sets `isModified`), so a re-render is forced here
  const [, forceRender] = useReducer((count: number) => count + 1, 0)

  const edit = (patch: Partial<typeof template>) => {
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
      </p>
      <p>
        modified:
        {' '}
        <strong>{isModified ? 'true' : 'false'}</strong>
      </p>
    </div>
  )
}
