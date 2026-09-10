// Worktree note: this demo imports the implementation relatively because the
// worktree's `@reaxuse/firebase` junction resolves to the main checkout, where
// `useAuth` does not exist yet. Published docs import from `@reaxuse/firebase`.
import type { Auth, User } from 'firebase/auth'
import { useAuth } from '../useAuth'

// demo-only stub — in a real app pass `getAuth(app)`. Its `onIdTokenChanged`
// reports the current state asynchronously and returns an unsubscribe, exactly
// like Firebase, so the `loading` state and the unmount cleanup are visible.
const listeners = new Set<(user: User | null) => void>()
let currentUser: User | null = null

const demoUser = { displayName: 'Ada Lovelace', email: 'ada@example.com' } as unknown as User

const demoAuth = {
  get currentUser() {
    return currentUser
  },
  onIdTokenChanged(next: (user: User | null) => void) {
    listeners.add(next)
    // Firebase answers asynchronously with the state it knows about right now,
    // and the buttons stay disabled while `loading`, so nothing can race it
    const timer = setTimeout(next, 300, currentUser)
    return () => {
      clearTimeout(timer)
      listeners.delete(next)
    }
  },
} as unknown as Auth

function signIn(): void {
  currentUser = demoUser
  listeners.forEach(listener => listener(currentUser))
}

function signOut(): void {
  currentUser = null
  listeners.forEach(listener => listener(null))
}

export default function UseAuthDemo() {
  const { isAuthenticated, user, loading, error } = useAuth(demoAuth)

  return (
    <div>
      <p>
        <small>demo-only stub `Auth` — a real app passes `getAuth(app)`.</small>
      </p>
      {loading && <p>Loading...</p>}
      {!loading && error && <p>{`Auth error: ${error.message}`}</p>}
      {!loading && !isAuthenticated && <p>Please log in</p>}
      {!loading && isAuthenticated && (
        <pre lang="json">
          {JSON.stringify({ displayName: user?.displayName, email: user?.email }, null, 2)}
        </pre>
      )}
      <button type="button" onClick={signIn} disabled={loading || isAuthenticated}>
        Sign In with Google
      </button>
      <button type="button" onClick={signOut} disabled={loading || !isAuthenticated}>
        Sign Out
      </button>
    </div>
  )
}
