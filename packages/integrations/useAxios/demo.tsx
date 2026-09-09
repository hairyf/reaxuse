// Relative (not `@reaxuse/integrations`): until this PR is merged the package
// name resolves through the worktree node_modules junction to the main repo's
// still-empty integrations package.
import { noop } from '@reaxuse/shared'
import { useAxios } from '../src/useAxios'

interface Todo {
  userId: number
  id: number
  title: string
  completed: boolean
}

export default function UseAxiosDemo() {
  // demos are never executed in CI, so a public endpoint is fine here
  const { data, isLoading, isFinished, isAborted, error, execute, abort } = useAxios<Todo>(
    'https://jsonplaceholder.typicode.com/todos/1',
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => void execute().catch(noop)}>
          Execute
        </button>
        <button onClick={() => abort()}>
          Abort
        </button>
      </div>
      <div>
        Loading:
        {isLoading.toString()}
      </div>
      <div>
        Finished:
        {isFinished.toString()}
      </div>
      <div>
        Aborted:
        {isAborted.toString()}
      </div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {error ? <pre>{String(error)}</pre> : null}
    </div>
  )
}
