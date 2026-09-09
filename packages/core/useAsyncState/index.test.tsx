import { noop, promiseTimeout } from '@reaxuse/shared'
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useAsyncState } from '../useAsyncState'

// Tests that intentionally reject pass an explicit `onError: noop`: the
// upstream default `onError` is `globalThis.reportError ?? noop`, which
// resolves to `noop` in upstream's jsdom test env — but the vitest-browser
// tests run in a real Chromium where `reportError` exists, and every expected
// rejection would be reported to the page (turning them into unhandled page
// errors). The default is exercised separately in the `reportError` test.
describe('useAsyncState', () => {
  it('should be defined', () => {
    expect(useAsyncState).toBeDefined()
  })

  const p1 = (num = 1) => {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(num)
      }, 50)
    })
  }
  const p2 = async (id?: string) => {
    if (!id)
      throw new Error('error')
    return id
  }

  it('should work', async () => {
    const { result } = await renderHook(() => useAsyncState(p1, 0))
    expect(result.current.state).toBe(0)
    await result.current.execute(0, 2)
    await vi.waitFor(() => {
      expect(result.current.state).toBe(2)
    })
  })

  it('should executeImmediate', async () => {
    const { result } = await renderHook(() => useAsyncState(p1, 0))
    expect(result.current.state).toBe(0)
    result.current.executeImmediate(2)
    await vi.waitFor(() => {
      expect(result.current.state).toBe(2)
    })
  })

  it('should work with await', async () => {
    const { result } = await renderHook(() => useAsyncState(p1, 0, { immediate: true }))
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBeTruthy()
    })
    const shell = await result.current
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBeFalsy()
    })
    expect(shell.isLoading).toBeFalsy()
  })

  it('should work with isLoading', async () => {
    const { result } = await renderHook(() => useAsyncState(p1, 0, { immediate: false }))
    expect(result.current.isLoading).toBeFalsy()
    result.current.execute(1)
    expect(result.current.isLoading).toBeTruthy()
  })

  it('should work with isReady', async () => {
    const { result } = await renderHook(() => useAsyncState(p1, 0, { immediate: false }))
    expect(result.current.isReady).toBeFalsy()
    await result.current.execute(1)
    await vi.waitFor(() => {
      expect(result.current.isReady).toBeTruthy()
    })
  })

  it('should reset isReady on re-execution', async () => {
    const { result } = await renderHook(() => useAsyncState(p1, 0, { immediate: false }))
    await result.current.execute()
    await vi.waitFor(() => {
      expect(result.current.isReady).toBeTruthy()
    })
    const promise = result.current.execute()
    expect(result.current.isReady).toBeFalsy()
    await promise
    await vi.waitFor(() => {
      expect(result.current.isReady).toBeTruthy()
    })
  })

  it('should keep isReady false when the promise rejects', async () => {
    const { result } = await renderHook(() => useAsyncState(p2, '0', { onError: noop, immediate: false }))
    await result.current.execute()
    expect(result.current.isReady).toBeFalsy()
    expect(result.current.isLoading).toBeFalsy()
  })

  it('should work with error', async () => {
    const { result } = await renderHook(() => useAsyncState(p2, '0', { onError: noop, immediate: false }))
    expect(result.current.error).toBeUndefined()
    await result.current.execute()
    expect(result.current.error).toBeInstanceOf(Error)
  })

  it('should work with delay', async () => {
    const { result } = await renderHook(() => useAsyncState(p1, 0, { delay: 100 }))
    await promiseTimeout(50)
    expect(result.current.state).toBe(0)
    await result.current.execute(0, 2)
    await vi.waitFor(() => {
      expect(result.current.state).toBe(2)
    })
  })

  it('should work with onSuccess', async () => {
    const onSuccess = vi.fn()
    const { result } = await renderHook(() => useAsyncState(p1, 0, { onSuccess }))
    await result.current.execute(0, 2)
    expect(onSuccess).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith(2)
  })

  it('should work with onError', async () => {
    const onError = vi.fn()
    const { result } = await renderHook(() => useAsyncState(p2, '0', { onError, immediate: false }))
    await result.current.execute()
    expect(onError).toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith(new Error('error'))
  })

  it('should work with throwError', async () => {
    const { result } = await renderHook(() => useAsyncState(p2, '0', { onError: noop, throwError: true, immediate: false }))
    await expect(result.current.execute()).rejects.toThrowError('error')
  })

  it('default onError uses globalThis.reportError', async () => {
    const originalReportError = globalThis.reportError
    const mockReportError = vi.fn()
    globalThis.reportError = mockReportError

    const error = new Error('error message')
    const func = vi.fn<() => Promise<string>>(async () => {
      throw error
    })

    try {
      const { result } = await renderHook(() => useAsyncState(func, '', { immediate: false }))
      await result.current.execute()
      expect(func).toBeCalledTimes(1)
      expect(mockReportError).toHaveBeenCalledWith(error)
    }
    finally {
      globalThis.reportError = originalReportError
    }
  })

  it('supports initialState as a controlled state tuple', async () => {
    const current = 200
    const setCurrent = vi.fn()
    const { result } = await renderHook(() => useAsyncState(Promise.resolve(100), [current, setCurrent] as const))
    await vi.waitFor(() => {
      expect(result.current.state).toBe(100)
    })
    expect(setCurrent).toHaveBeenCalledWith(100)
  })

  it('supports initialState as ref-like object', async () => {
    const initialState = { current: 200 }
    const asyncValue = Promise.resolve(100)
    const { result } = await renderHook(() => useAsyncState(asyncValue, initialState))
    await vi.waitFor(() => {
      expect(result.current.state).toBe(100)
    })
    expect(initialState.current).toBe(200)
  })

  it('does not set `state` from an outdated execution', async () => {
    const { result } = await renderHook(() => useAsyncState((returnValue: string, timeout: number) => promiseTimeout(timeout).then(() => returnValue), ''))
    await Promise.all([
      result.current.execute(0, 'foo', 100),
      result.current.execute(0, 'bar', 50),
    ])
    await vi.waitFor(() => {
      expect(result.current.state).toBe('bar')
    })
  })

  it('does not set `isReady` from an outdated execution', async () => {
    const { result } = await renderHook(() => useAsyncState(promiseTimeout, { current: undefined } as { current: void }))
    void result.current.execute(0, 0)
    void result.current.execute(0, 100)
    await promiseTimeout(50)
    expect(result.current.isReady).toBe(false)
  })

  it('does not set `isLoading` from an outdated execution', async () => {
    const { result } = await renderHook(() => useAsyncState(promiseTimeout, { current: undefined } as { current: void }))
    void result.current.execute(0, 0)
    void result.current.execute(0, 100)
    await promiseTimeout(50)
    expect(result.current.isLoading).toBe(true)
  })

  it('does not set `error` from an outdated execution', async () => {
    const { result } = await renderHook(() => useAsyncState(promiseTimeout, { current: undefined } as { current: void }, { onError: noop }))
    await Promise.all([
      result.current.execute(0, 100, true),
      result.current.execute(0, 0),
    ])
    await vi.waitFor(() => {
      expect(result.current.error).toBeUndefined()
    })
  })

  it('accepts `shallow` for API parity (no-op in React)', async () => {
    // VueUse uses `shallow` to choose `shallowRef` vs `ref` for `state`.
    // React state is never deep-wrapped, so both settings behave identically
    // and `state` is always the plain resolved value (identity preserved,
    // never a ref-like wrapper).
    const initial = { nested: { count: 0 } }
    const resolved = { nested: { count: 1 } }

    const deepResult = await renderHook(() => useAsyncState(Promise.resolve(resolved), initial, { shallow: false }))
    await vi.waitFor(() => {
      expect(deepResult.result.current.state).toBe(resolved)
    })

    const shallowResult = await renderHook(() => useAsyncState(Promise.resolve(resolved), initial, { shallow: true }))
    await vi.waitFor(() => {
      expect(shallowResult.result.current.state).toBe(resolved)
    })
  })
})
