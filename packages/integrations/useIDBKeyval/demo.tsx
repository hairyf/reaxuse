// Relative (not `@reaxuse/integrations`): until this PR is merged the package
// name resolves through the worktree node_modules junction to the main repo's
// still-empty integrations package.
import { useIDBKeyval } from '../src/useIDBKeyval'

interface DemoObject {
  name: string
  color: string
  size: string
  count: number
}

export default function UseIDBKeyvalDemo() {
  const KEY = 'reaxuse-use-idb-keyval'

  const [stateObject, setStateObject, { isFinished: objectFinished }] = useIDBKeyval<DemoObject>(
    `${KEY}-object`,
    { name: 'Banana', color: 'Yellow', size: 'Medium', count: 0 },
  )
  const [stateString, setStateString] = useIDBKeyval(`${KEY}-string`, 'foobar')
  const [stateArray, setStateArray] = useIDBKeyval(`${KEY}-array`, ['foo', 'bar', 'baz'])

  // React has no deep watcher: every edit is an explicit `setData` write
  const patchObject = (patch: Partial<DemoObject>) => {
    setStateObject({ ...(stateObject ?? { name: '', color: '', size: '', count: 0 }), ...patch })
  }

  const setArrayItem = (index: number, value: string) => {
    const next = [...(stateArray ?? [])]
    next[index] = value
    setStateArray(next)
  }

  return (
    <div>
      <h5>
        Object
        {objectFinished ? '' : '(loading…)'}
      </h5>
      <input
        type="text"
        value={stateObject?.name ?? ''}
        onChange={event => patchObject({ name: event.target.value })}
      >
      </input>
      <input
        type="text"
        value={stateObject?.color ?? ''}
        onChange={event => patchObject({ color: event.target.value })}
      >
      </input>
      <input
        type="text"
        value={stateObject?.size ?? ''}
        onChange={event => patchObject({ size: event.target.value })}
      >
      </input>
      <input
        type="range"
        min="0"
        step="0.01"
        max="1000"
        value={stateObject?.count ?? 0}
        onChange={event => patchObject({ count: Number(event.target.value) })}
      >
      </input>
      <pre>{JSON.stringify(stateObject, null, 2)}</pre>
      <br />

      <h5>String</h5>
      <input
        type="text"
        value={stateString ?? ''}
        onChange={event => setStateString(event.target.value)}
      >
      </input>
      <pre>{stateString}</pre>
      <br />

      <h5>Array</h5>
      {(stateArray ?? []).map((item, index) => (
        <input
          key={index}
          type="text"
          value={item}
          onChange={event => setArrayItem(index, event.target.value)}
        >
        </input>
      ))}
      <pre>{JSON.stringify(stateArray, null, 2)}</pre>
      <button onClick={() => setStateString(null)}>
        Delete string key
      </button>
    </div>
  )
}
