import { useSessionStorage } from '@reaxuse/core'

const theDefault = {
  name: 'Banana',
  color: 'Yellow',
  size: 'Medium',
  count: 0,
}

export default function UseSessionStorageDemo() {
  const [state, setState] = useSessionStorage('vue-use-session-storage', theDefault)
  const [state2] = useSessionStorage('vue-use-session-storage', theDefault)

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
          Remove from sessionStorage
        </button>
      </p>
    </div>
  )
}
