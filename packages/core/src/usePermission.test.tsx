import { afterEach, beforeEach, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { usePermission } from './usePermission'

type StatusState = 'granted' | 'denied' | 'prompt'

/**
 * A deterministic PermissionStatus stand-in: a `state` field plus a
 * 'change' listener registry that `dispatchChange` fires synchronously.
 */
function createPermissionStatus(initial: StatusState) {
  const listeners = new Set<(event: Event) => void>()
  const status = {
    state: initial,
    onchange: null,
    addEventListener(type: string, listener: (event: Event) => void) {
      if (type === 'change')
        listeners.add(listener)
    },
    removeEventListener(type: string, listener: (event: Event) => void) {
      listeners.delete(listener)
    },
    dispatchChange(next: StatusState) {
      status.state = next
      for (const listener of [...listeners])
        listener(new Event('change'))
    },
    listenerCount: () => listeners.size,
  }
  return status as typeof status & PermissionStatus
}

let restore = () => {}
let calls: PermissionDescriptor[] = []
let queryImpl: (desc: PermissionDescriptor) => Promise<PermissionStatus>
  = async () => createPermissionStatus('prompt')

// The Permissions API is not grantable in the chromium test env by default —
// stub `navigator.permissions` (configurable, restored after each test) with
// a fake query so every run is deterministic.
beforeEach(() => {
  calls = []
  const permissions = {
    query: (desc: PermissionDescriptor) => {
      calls.push(desc)
      return queryImpl(desc)
    },
  }
  const original = Object.getOwnPropertyDescriptor(navigator, 'permissions')
  Object.defineProperty(navigator, 'permissions', { configurable: true, value: permissions })
  restore = () => {
    if (original)
      Object.defineProperty(navigator, 'permissions', original)
    else
      delete (navigator as unknown as { permissions?: unknown }).permissions
  }
})

afterEach(() => {
  restore()
})

it.each(['granted', 'denied', 'prompt'] as const)('resolves the initial %s permission state', async (state) => {
  queryImpl = async () => createPermissionStatus(state)
  const { result } = await renderHook(() => usePermission('geolocation'))
  await expect.poll(() => result.current).toBe(state)
})

it('stays prompt until the async query resolves', async () => {
  let resolve!: (status: PermissionStatus) => void
  queryImpl = () => new Promise((res) => {
    resolve = res
  })
  const { result, act } = await renderHook(() => usePermission('geolocation'))

  expect(result.current).toBe('prompt')

  await act(async () => {
    resolve(createPermissionStatus('granted'))
  })
  await expect.poll(() => result.current).toBe('granted')
})

it('updates when the PermissionStatus change event fires', async () => {
  const status = createPermissionStatus('granted')
  queryImpl = async () => status
  const { result, act } = await renderHook(() => usePermission('geolocation'))
  await expect.poll(() => result.current).toBe('granted')

  await act(async () => {
    status.dispatchChange('denied')
  })
  await expect.poll(() => result.current).toBe('denied')

  await act(async () => {
    status.dispatchChange('granted')
  })
  await expect.poll(() => result.current).toBe('granted')
})

it('accepts a descriptor object and passes it to the query', async () => {
  queryImpl = async () => createPermissionStatus('granted')
  const { result } = await renderHook(() => usePermission({ name: 'microphone' }))
  await expect.poll(() => result.current).toBe('granted')
  expect(calls[0]).toEqual({ name: 'microphone' })
})

it('accepts a polyfill descriptor name object', async () => {
  queryImpl = async () => createPermissionStatus('prompt')
  const { result } = await renderHook(() => usePermission({ name: 'accelerometer' }))
  await expect.poll(() => result.current).toBe('prompt')
  expect(calls[0]).toEqual({ name: 'accelerometer' })
})

it('re-queries when the descriptor changes', async () => {
  const statuses: Record<string, PermissionStatus> = {
    geolocation: createPermissionStatus('granted'),
    camera: createPermissionStatus('denied'),
  }
  queryImpl = desc => Promise.resolve(statuses[desc.name])
  const { result, rerender } = await renderHook(
    (props?: { desc?: 'geolocation' | 'camera' }) => usePermission(props?.desc ?? 'geolocation'),
  )
  await expect.poll(() => result.current).toBe('granted')

  rerender({ desc: 'camera' })
  await expect.poll(() => result.current).toBe('denied')
  expect(calls.map(call => call.name)).toEqual(['geolocation', 'camera'])
})

it('falls back to prompt when the Permissions API is unavailable', async () => {
  Object.defineProperty(navigator, 'permissions', { configurable: true, value: undefined })
  const { result } = await renderHook(() => usePermission('geolocation'))
  expect(result.current).toBe('prompt')
})

it('falls back to prompt when the query rejects', async () => {
  queryImpl = async () => {
    throw new Error('query failed')
  }
  const { result } = await renderHook(() => usePermission('geolocation'))
  await expect.poll(() => result.current).toBe('prompt')
})

it('removes the change listener on unmount', async () => {
  const status = createPermissionStatus('granted')
  queryImpl = async () => status
  const { result, unmount } = await renderHook(() => usePermission('geolocation'))
  await expect.poll(() => result.current).toBe('granted')
  expect(status.listenerCount()).toBe(1)

  unmount()
  expect(status.listenerCount()).toBe(0)

  status.dispatchChange('denied')
  expect(result.current).toBe('granted')
})

it('exposes isSupported and query with controls: true', async () => {
  const status = createPermissionStatus('prompt')
  queryImpl = async () => status
  const { result, act } = await renderHook(() => usePermission('geolocation', { controls: true }))
  await expect.poll(() => result.current.isSupported).toBe(true)
  await expect.poll(() => status.listenerCount()).toBe(1)
  expect(result.current.state).toBe('prompt')

  await act(async () => {
    status.dispatchChange('granted')
  })
  await expect.poll(() => result.current.state).toBe('granted')

  await act(async () => {
    await result.current.query()
  })
  expect(calls.length).toBe(2)
})
