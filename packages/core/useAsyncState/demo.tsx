import { useAsyncState } from '@reause/core'

export default function UseAsyncStateDemo() {
  const { state, setState, isReady, isLoading, execute } = useAsyncState(
    (args?: { id?: number }) => {
      const id = args?.id || 1
      return fetch(`https://jsonplaceholder.typicode.com/todos/${id}`).then(res => res.json())
    },
    {},
    {
      delay: 2000,
      resetOnExecute: false,
    },
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div className="text-primary text-lg font-bold">
        Ready:
        {' '}
        {String(isReady)}
      </div>
      <div className="text-primary text-lg font-bold">
        Loading:
        {' '}
        {String(isLoading)}
      </div>
      <pre className="code-block ml-2">
        {JSON.stringify(state, null, 2)}
      </pre>
      <button type="button" onClick={() => execute(2000, { id: 2 })}>
        Execute
      </button>
      <button type="button" onClick={() => setState({ id: 999, title: 'Set locally, no execution' })}>
        Set state
      </button>
    </div>
  )
}
