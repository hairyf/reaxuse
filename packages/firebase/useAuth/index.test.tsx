import type { Auth, Unsubscribe, User } from 'firebase/auth'
import { describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useAuth } from '../useAuth'

// `useAuth` imports **types only** from `firebase/auth` (erased at build time),
// so nothing from Firebase is loaded or pre-bundled here and no project config
// is required: a real app passes `getAuth(app)`, these tests inject the fake
// `Auth` below. Only the `Auth`/`User`/`Unsubscribe` shapes are borrowed from
// the real typings.

type AuthStateCallback = (user: User | null) => void

// fake `User` built at the test boundary only; the implementation itself has no
// cast.
function fakeUser(displayName: string): User {
  return { displayName } as any
}

/**
 * Minimal stand-in for `getAuth(app)` — records the listener registered through
 * `onIdTokenChanged` and lets a test drive Firebase's auth-state events.
 */
function fakeAuth(currentUser: User | null = null) {
  const state = { currentUser }
  const listeners = new Set<AuthStateCallback>()

  const onIdTokenChanged = vi.fn<(next: AuthStateCallback) => Unsubscribe>((next) => {
    listeners.add(next)
    return () => listeners.delete(next)
  })

  const auth = {
    get currentUser() {
      return state.currentUser
    },
    onIdTokenChanged,
  } as unknown as Auth

  return {
    auth,
    onIdTokenChanged,
    /** simulate Firebase reporting a state change (sign-in, sign-out, refresh) */
    emit(nextUser: User | null) {
      state.currentUser = nextUser
      listeners.forEach(listener => listener(nextUser))
    },
    /** listeners still registered — `0` once every unsubscribe ran */
    listenerCount: () => listeners.size,
  }
}

function Profile({ auth, onSignIn, onSignOut }: {
  auth: Auth
  onSignIn: () => void
  onSignOut: () => void
}) {
  const { isAuthenticated, user, loading } = useAuth(auth)

  // the usage pattern from the porting issue: loading → signed out → welcome
  const status = () => {
    if (loading)
      return 'Loading...'
    if (!isAuthenticated)
      return 'Please log in'
    return `Welcome, ${user?.displayName}`
  }

  return (
    <div>
      <div data-testid="status">{status()}</div>
      <button type="button" onClick={onSignIn}>sign in</button>
      <button type="button" onClick={onSignOut}>sign out</button>
    </div>
  )
}

describe('useAuth', () => {
  it('starts loading, subscribes once, then resolves with the first callback', async () => {
    const user = fakeUser('Ada')
    const { auth, onIdTokenChanged, emit } = fakeAuth()

    const { result, act } = await renderHook(() => useAuth(auth))

    // Firebase reports the auth state asynchronously: render is loading, not signed out
    expect(result.current.loading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeNull()
    expect(onIdTokenChanged).toHaveBeenCalledTimes(1)

    await act(() => {
      emit(user)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toBe(user)
  })

  it('seeds user from auth.currentUser (upstream parity)', async () => {
    const user = fakeUser('Ada')
    const { auth } = fakeAuth(user)

    const { result } = await renderHook(() => useAuth(auth))

    expect(result.current.user).toBe(user)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.loading).toBe(true)
  })

  it('reports the signed-out state when Firebase reports no user', async () => {
    const { auth, emit } = fakeAuth(fakeUser('Ada'))

    const { result, act } = await renderHook(() => useAuth(auth))

    await act(() => {
      emit(null)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('re-subscribes when the auth instance changes and unsubscribes the previous listener', async () => {
    const first = fakeAuth()
    const second = fakeAuth(fakeUser('Grace'))

    const { result, rerender, act } = await renderHook(
      ({ auth }: { auth: Auth } = { auth: first.auth }) => useAuth(auth),
      { initialProps: { auth: first.auth } },
    )

    await act(() => {
      first.emit(fakeUser('Ada'))
    })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.loading).toBe(false)

    await rerender({ auth: second.auth })

    expect(second.onIdTokenChanged).toHaveBeenCalledTimes(1)
    expect(first.listenerCount()).toBe(0)
    // the previous instance's state is stale — re-seeded from the new instance
    expect(result.current.user).toBe(second.auth.currentUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()

    await rerender({ auth: second.auth })
    expect(second.onIdTokenChanged).toHaveBeenCalledTimes(1)
  })

  it('captures a failing subscription, stops loading and calls the error handler', async () => {
    const { auth, onIdTokenChanged } = fakeAuth()
    const failure = new Error('auth/invalid-api-key')
    onIdTokenChanged.mockImplementation(() => {
      throw failure
    })

    const errorHandler = vi.fn<(err: Error) => void>()
    const { result } = await renderHook(() => useAuth(auth, { errorHandler }))

    expect(result.current.error).toBe(failure)
    // no callback will ever arrive — the caller must not stay on a loading screen
    expect(result.current.loading).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(errorHandler).toHaveBeenCalledTimes(1)
    expect(errorHandler).toHaveBeenCalledWith(failure)
  })

  it('normalises a non-Error subscription failure', async () => {
    const { auth, onIdTokenChanged } = fakeAuth()
    // an SDK is free to reject with anything — `error` must still be an `Error`
    const failure: unknown = 'auth/network-request-failed'
    onIdTokenChanged.mockImplementation(() => {
      throw failure
    })

    const { result } = await renderHook(() => useAuth(auth, { errorHandler: () => {} }))

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('auth/network-request-failed')
    expect(result.current.loading).toBe(false)
  })

  it('logs through console.error by default', async () => {
    const { auth, onIdTokenChanged } = fakeAuth()
    const failure = new Error('auth/network-request-failed')
    onIdTokenChanged.mockImplementation(() => {
      throw failure
    })

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await renderHook(() => useAuth(auth))

      expect(consoleError).toHaveBeenCalledWith(failure)
    }
    finally {
      consoleError.mockRestore()
    }
  })

  it('uses the latest errorHandler without re-subscribing', async () => {
    const { auth, onIdTokenChanged } = fakeAuth()
    const first = vi.fn<(err: Error) => void>()
    const second = vi.fn<(err: Error) => void>()
    onIdTokenChanged.mockImplementation(() => {
      throw new Error('auth/network-request-failed')
    })

    const { rerender } = await renderHook(
      ({ errorHandler }: { errorHandler: (err: Error) => void } = { errorHandler: first }) => useAuth(auth, { errorHandler }),
      { initialProps: { errorHandler: first } },
    )

    expect(onIdTokenChanged).toHaveBeenCalledTimes(1)
    expect(first).toHaveBeenCalledTimes(1)

    await rerender({ errorHandler: second })

    expect(onIdTokenChanged).toHaveBeenCalledTimes(1)
    expect(second).not.toHaveBeenCalled()
  })

  it('calls the Unsubscribe returned by onIdTokenChanged on unmount', async () => {
    const { auth, onIdTokenChanged } = fakeAuth()
    const off = vi.fn<Unsubscribe>()
    onIdTokenChanged.mockReturnValue(off)

    const { unmount } = await renderHook(() => useAuth(auth))

    expect(off).not.toHaveBeenCalled()
    await unmount()
    expect(off).toHaveBeenCalledTimes(1)
  })

  it('drops the listener on unmount', async () => {
    const { auth, listenerCount } = fakeAuth()

    const { unmount } = await renderHook(() => useAuth(auth))

    expect(listenerCount()).toBe(1)
    await unmount()
    expect(listenerCount()).toBe(0)
  })

  it('ignores a callback delivered after unmount', async () => {
    const { auth, onIdTokenChanged, emit } = fakeAuth()
    // a no-op unsubscribe leaves the listener registered, as an auth SDK racing
    // an unmount would
    onIdTokenChanged.mockReturnValue(vi.fn<Unsubscribe>())

    const { result, unmount } = await renderHook(() => useAuth(auth))
    await unmount()

    emit(fakeUser('Ada'))

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('drives the component flow from loading to authenticated to signed out', async () => {
    const user = fakeUser('Ada')
    const { auth, emit } = fakeAuth()

    const screen = await render(
      <Profile
        auth={auth}
        onSignIn={() => emit(user)}
        onSignOut={() => emit(null)}
      />,
    )

    const status = screen.getByTestId('status')
    await expect.element(status).toHaveTextContent('Loading...')

    await screen.getByRole('button', { name: 'sign in' }).click()
    await expect.element(status).toHaveTextContent('Welcome, Ada')

    await screen.getByRole('button', { name: 'sign out' }).click()
    await expect.element(status).toHaveTextContent('Please log in')
  })
})
