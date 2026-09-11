// Worktree note: this demo imports the implementation relatively because the
// worktree's `@reause/firebase` junction resolves to the main checkout, where
// `useFirestore` does not exist yet. Published docs import from
// `@reause/firebase`.
import type { Query } from 'firebase/firestore'
import { useState } from 'react'
import { useFirestore } from '../useFirestore'

interface Todo {
  id: string
  title: string
  done: boolean
}

// demo-only stub — in a real app pass `collection(db, 'todos')`. The real
// Firestore SDK rejects a stub reference (`Expected type 'Query'...`), which
// the hook routes through `errorHandler`; pass real references for live data.
const demoQuery = { path: 'todos' } as unknown as Query<Todo>

export default function UseFirestoreDemo() {
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // a falsy reference renders the initial value and subscribes to nothing;
  // a (stub) reference would subscribe through `onSnapshot`
  const todos = useFirestore(streaming ? demoQuery : false, [
    { id: 'seed', title: 'initial value — no subscription', done: false },
  ], {
    errorHandler: (err) => {
      setError(err)
      console.error(err)
    },
  })

  return (
    <div>
      <p>
        <small>demo-only stub `Query` — a real app passes `collection(db, 'todos')`.</small>
      </p>
      <pre lang="json">{JSON.stringify(todos, null, 2)}</pre>
      {error && <p>{`subscription error: ${error.message}`}</p>}
      <button type="button" onClick={() => setStreaming(streaming => !streaming)}>
        {streaming ? 'Stop subscribing' : 'Subscribe'}
      </button>
    </div>
  )
}
