// Worktree note: this demo imports the implementation relatively because the
// worktree's `@reaxuse/firebase` junction resolves to the main checkout, where
// `useRTDB` does not exist yet. Published docs import from `@reaxuse/firebase`.
import type { DatabaseReference } from 'firebase/database'
import { useState } from 'react'
import { useRTDB } from '../src/useRTDB'

// demo-only stub — in a real app pass `ref(getDatabase(app), 'path')`
const demoRef = { path: 'todos' } as unknown as DatabaseReference

export default function UseRTDBDemo() {
  const [todos, setTodos] = useRTDB<Record<string, string>>(demoRef)
  const [draft, setDraft] = useState('')

  return (
    <div>
      <p>Realtime Database value (demo-only stub reference):</p>
      <pre lang="json">{JSON.stringify(todos ?? null, null, 2)}</pre>
      <input
        placeholder="new todo"
        value={draft}
        onChange={event => setDraft(event.target.value)}
      />
      <button
        type="button"
        onClick={() => setTodos({ ...todos, [draft || 'demo']: 'local only' })}
      >
        Set locally
      </button>
      <p>
        <small>
          setData updates local state only — it never writes to the database.
        </small>
      </p>
    </div>
  )
}
