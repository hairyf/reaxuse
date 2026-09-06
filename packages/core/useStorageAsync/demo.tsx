import type { StorageLikeAsync } from '@reaxuse/core'
import { useStorageAsync } from '@reaxuse/core'

// async adapter around localStorage — every call resolves on a microtask, so
// the demo shows the value loading asynchronously after mount
const asyncLocalStorage: StorageLikeAsync = {
  getItem: async key => localStorage.getItem(key),
  setItem: async (key, value) => {
    localStorage.setItem(key, value)
  },
  removeItem: async (key) => {
    localStorage.removeItem(key)
  },
}

const theDefault = {
  name: 'Banana',
  color: 'Yellow',
  size: 'Medium',
  count: 0,
}

export default function UseStorageAsyncDemo() {
  const [state, setState] = useStorageAsync('vue-use-async-storage', theDefault, asyncLocalStorage)
  const [state2] = useStorageAsync('vue-use-async-storage', theDefault, asyncLocalStorage)

  const update = (patch: Partial<typeof theDefault>) =>
    setState(prev => ({ ...(prev ?? theDefault), ...patch }))

  return (
    <div>
      <p>
        <input
          type="text"
          value={state?.name ?? ''}
          onChange={event => update({ name: event.target.value })}
        />
        {' '}
        <input
          type="text"
          value={state?.color ?? ''}
          onChange={event => update({ color: event.target.value })}
        />
        {' '}
        <input
          type="text"
          value={state?.size ?? ''}
          onChange={event => update({ size: event.target.value })}
        />
      </p>
      <p>
        <input
          type="range"
          min="0"
          max="1000"
          step="0.01"
          value={state?.count ?? 0}
          onChange={event => update({ count: Number(event.target.value) })}
        />
        {' '}
        <strong>{state?.count ?? 0}</strong>
      </p>
      <pre lang="json">{JSON.stringify(state2, null, 2)}</pre>
      <p>
        <button onClick={() => setState(null)}>
          Remove from localStorage
        </button>
      </p>
    </div>
  )
}
