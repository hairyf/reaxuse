import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useLiveAnnouncer } from '../useLiveAnnouncer'

// Vue's `nextTick` has no React counterpart. `announce` writes the message
// after one microtask (mirroring upstream), so the tests flush the same way —
// Promise-based so it also resolves under `vi.useFakeTimers()`.
const nextTick = () => Promise.resolve()

describe('useLiveAnnouncer', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('should be defined', () => {
    expect(useLiveAnnouncer).toBeDefined()
  })

  it('should create announcer elements', async () => {
    const { result } = await renderHook(() => useLiveAnnouncer())
    result.current.announce('Test message')
    await nextTick()

    const container = document.getElementById('vueuse-live-announcer-container')
    const polite = document.getElementById('vueuse-live-announcer-polite')
    const assertive = document.getElementById('vueuse-live-announcer-assertive')

    expect(container).not.toBeNull()
    expect(polite).not.toBeNull()
    expect(assertive).not.toBeNull()

    expect(polite?.getAttribute('aria-live')).toBe('polite')
    expect(polite?.getAttribute('role')).toBe('status')
    expect(polite?.getAttribute('aria-atomic')).toBe('true')
    expect(polite?.textContent).toBe('Test message')

    expect(assertive?.getAttribute('aria-live')).toBe('assertive')
    expect(assertive?.getAttribute('role')).toBe('alert')
    expect(assertive?.getAttribute('aria-atomic')).toBe('true')
  })

  it('should support polite announcement', async () => {
    const { result } = await renderHook(() => useLiveAnnouncer())
    result.current.polite('Polite message')
    await nextTick()

    const politeEl = document.getElementById('vueuse-live-announcer-polite')
    expect(politeEl?.textContent).toBe('Polite message')
  })

  it('should support assertive announcement', async () => {
    const { result } = await renderHook(() => useLiveAnnouncer())
    result.current.assertive('Assertive message')
    await nextTick()

    const assertiveEl = document.getElementById('vueuse-live-announcer-assertive')
    expect(assertiveEl?.textContent).toBe('Assertive message')
  })

  it('should clear message after timeout', async () => {
    vi.useFakeTimers()
    const { result } = await renderHook(() => useLiveAnnouncer())
    const timeout = 500

    result.current.announce('Temp message', 'polite', timeout)
    await nextTick()

    const politeEl = document.getElementById('vueuse-live-announcer-polite')
    expect(politeEl?.textContent).toBe('Temp message')

    vi.advanceTimersByTime(timeout - 10)
    expect(politeEl?.textContent).toBe('Temp message')

    vi.advanceTimersByTime(20)
    expect(politeEl?.textContent).toBe('')
  })

  it('should clear previous timer when new announcement is made', async () => {
    vi.useFakeTimers()
    const { result } = await renderHook(() => useLiveAnnouncer())

    result.current.assertive('First message', 1000)
    await nextTick()

    vi.advanceTimersByTime(500)
    result.current.assertive('Second message', 1000)
    await nextTick()

    const assertiveEl = document.getElementById('vueuse-live-announcer-assertive')
    expect(assertiveEl?.textContent).toBe('Second message')

    vi.advanceTimersByTime(500)
    expect(assertiveEl?.textContent).toBe('Second message')

    vi.advanceTimersByTime(500)
    expect(assertiveEl?.textContent).toBe('')
  })

  it('should not clear a re-announced identical message early', async () => {
    vi.useFakeTimers()
    const { result } = await renderHook(() => useLiveAnnouncer())

    result.current.polite('Same message', 1000)
    await nextTick()

    vi.advanceTimersByTime(500)
    // Re-announce the identical text; the first timer must be cancelled.
    result.current.polite('Same message', 1000)
    await nextTick()

    const politeEl = document.getElementById('vueuse-live-announcer-polite')

    // At t=1000 the first (cancelled) timer would have wiped the message.
    vi.advanceTimersByTime(500)
    expect(politeEl?.textContent).toBe('Same message')

    // Only the second timer (t=1500) should clear it.
    vi.advanceTimersByTime(500)
    expect(politeEl?.textContent).toBe('')
  })

  it('should support custom idPrefix', async () => {
    const { result } = await renderHook(() => useLiveAnnouncer({ idPrefix: 'custom-announcer' }))
    result.current.announce('Custom prefix message')
    await nextTick()

    const container = document.getElementById('custom-announcer-container')
    const polite = document.getElementById('custom-announcer-polite')
    const assertive = document.getElementById('custom-announcer-assertive')

    expect(container).not.toBeNull()
    expect(polite).not.toBeNull()
    expect(assertive).not.toBeNull()
    expect(polite?.textContent).toBe('Custom prefix message')
  })

  it('should handle undefined document', async () => {
    const { result } = await renderHook(() => {
      // @ts-expect-error mock window without document
      return useLiveAnnouncer({ window: {} })
    })
    expect(() => result.current.announce('test')).not.toThrow()
  })

  it('should cleanup container when scope is disposed', async () => {
    const { unmount } = await renderHook(() => useLiveAnnouncer({ idPrefix: 'test-scope' }))
    expect(document.getElementById('test-scope-container')).not.toBeNull()

    await unmount()
    expect(document.getElementById('test-scope-container')).toBeNull()
  })

  it('should handle reference counting correctly', async () => {
    const scopeA = await renderHook(() => useLiveAnnouncer({ idPrefix: 'test-scope-1' }))
    const scopeB = await renderHook(() => useLiveAnnouncer({ idPrefix: 'test-scope-2' }))
    const scopeC = await renderHook(() => useLiveAnnouncer({ idPrefix: 'test-scope-2' }))
    expect(document.getElementById('test-scope-1-container')).not.toBeNull()
    expect(document.getElementById('test-scope-2-container')).not.toBeNull()

    await scopeA.unmount()
    expect(document.getElementById('test-scope-1-container')).toBeNull()
    expect(document.getElementById('test-scope-2-container')).not.toBeNull()

    await scopeB.unmount()
    expect(document.getElementById('test-scope-1-container')).toBeNull()
    expect(document.getElementById('test-scope-2-container')).not.toBeNull()

    await scopeC.unmount()
    expect(document.getElementById('test-scope-1-container')).toBeNull()
    expect(document.getElementById('test-scope-2-container')).toBeNull()
  })

  it('should handle missing DOM elements', async () => {
    const { unmount } = await renderHook(() => useLiveAnnouncer({ idPrefix: 'defensive' }))
    const container = document.getElementById('defensive-container')
    container?.remove()
    await unmount()
  })

  it('should handle invalid parameters', async () => {
    const { result } = await renderHook(() => useLiveAnnouncer({ idPrefix: 'defensive-2' }))
    const secondContainer = document.getElementById('defensive-2-container')
    secondContainer?.remove()
    // @ts-expect-error testing invalid mode fallback
    expect(() => result.current.announce('test', 'invalid')).not.toThrow()
  })
})
