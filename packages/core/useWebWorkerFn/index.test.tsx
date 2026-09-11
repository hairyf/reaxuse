import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useWebWorkerFn } from '../useWebWorkerFn'

// defined by the importScripts'ed blob script inside the worker; declared
// here only so the test file type-checks (the `fn` body is stringified)
declare const DOUBLE: (n: number) => number

// Upstream ships no tests for useWebWorkerFn. These use real dedicated
// workers spawned from blob: URLs and expect.poll for the async
// postMessage/onmessage round-trips, mirroring useWebWorker.test.tsx. The
// heavy worker functions busy-wait inside the worker thread so RUNNING stays
// observable without blocking the main thread. External `dependencies`
// (importScripts) are exercised with blob: URLs, which share the document
// origin and are importable from a blob worker in chromium.

// The browser runner installs Playwright route interception for the module
// mocker, and WebKit cannot spawn a worker whose script comes from a `blob:`
// URL under it: the worker request rejects inside the mocker, and the resulting
// unhandled rejection aborts the whole suite. Upstream ships no tests for this
// hook at all, so the real-worker round-trips stay chromium-only while the
// shape/SSR cases run on both engines.
const isWebkit = /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium/.test(navigator.userAgent)
const itWorker = it.skipIf(isWebkit)

describe('useWebWorkerFn', () => {
  it('returns an object mirroring the upstream return shape', async () => {
    const { result } = await renderHook(() => useWebWorkerFn(() => 42))

    expect(result.current.workerStatus).toBe('PENDING')
    expect(typeof result.current.workerFn).toBe('function')
    expect(typeof result.current.workerTerminate).toBe('function')
  })

  itWorker('runs the function in a worker and resolves with the result', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn((a: number, b: number) => a + b))

    let p!: Promise<number>
    await act(() => {
      p = result.current.workerFn(2, 3)
    })

    await expect(p).resolves.toBe(5)
  })

  itWorker('passes the fn arguments through to the worker', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn((items: number[]) => items.map(n => n * 2)))

    let p!: Promise<number[]>
    await act(() => {
      p = result.current.workerFn([1, 2, 3])
    })

    await expect(p).resolves.toEqual([2, 4, 6])
  })

  itWorker('tracks workerStatus from RUNNING to SUCCESS', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn(() => {
      // resolve on a worker-side timer so RUNNING is observable without a
      // busy-wait that could finish before the assertion runs
      return new Promise<number>(resolve => setTimeout(resolve, 100, 42))
    }))

    await act(() => {
      void result.current.workerFn()
    })

    expect(result.current.workerStatus).toBe('RUNNING')
    await expect.poll(() => result.current.workerStatus).toBe('SUCCESS')
  })

  itWorker('allows a new workerFn call after the previous one finished', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn((a: number, b: number) => a + b))

    let first!: Promise<number>
    await act(() => {
      first = result.current.workerFn(1, 2)
    })
    await expect(first).resolves.toBe(3)
    await expect.poll(() => result.current.workerStatus).toBe('SUCCESS')

    let second!: Promise<number>
    await act(() => {
      second = result.current.workerFn(3, 4)
    })
    await expect(second).resolves.toBe(7)
  })

  itWorker('rejects when the worker function throws and sets status to ERROR', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn(() => {
      throw new Error('worker boom')
    }))

    let p!: Promise<never>
    await act(() => {
      p = result.current.workerFn()
    })

    await expect(p).rejects.toThrow('worker boom')
    await expect.poll(() => result.current.workerStatus).toBe('ERROR')
  })

  itWorker('rejects a second workerFn call while one is running', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn(() => {
      // the worker stays RUNNING for 200ms, so the guard is reached long
      // before the first call could settle
      return new Promise<number>(resolve => setTimeout(resolve, 200, 1))
    }))

    await act(() => {
      void result.current.workerFn()
    })
    expect(result.current.workerStatus).toBe('RUNNING')

    const second = result.current.workerFn()
    await expect(second).rejects.toBeUndefined()

    // the first call still resolves after its worker completes
    await expect.poll(() => result.current.workerStatus).toBe('SUCCESS')
  })

  itWorker('terminates the running worker and allows a new call afterwards', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn(() => {
      // resolves on a worker-side timer, so the worker is still RUNNING when
      // the test terminates it synchronously below
      return new Promise<number>(resolve => setTimeout(resolve, 100, 42))
    }))

    await act(() => {
      void result.current.workerFn()
    })
    expect(result.current.workerStatus).toBe('RUNNING')

    await act(() => {
      result.current.workerTerminate('PENDING')
    })
    expect(result.current.workerStatus).toBe('PENDING')

    // the terminated worker's promise never settles (upstream keeps the
    // pending promise unresolved on terminate) — a fresh call spawns a new
    // worker and completes normally
    await act(() => {
      void result.current.workerFn()
    })
    await expect.poll(() => result.current.workerStatus).toBe('SUCCESS')
  })

  itWorker('sets status to TIMEOUT_EXPIRED when the worker exceeds the timeout', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn(() => new Promise<number>(() => {}), { timeout: 100 }))

    await act(() => {
      void result.current.workerFn()
    })

    await expect.poll(() => result.current.workerStatus).toBe('TIMEOUT_EXPIRED')
  })

  itWorker('injects local dependencies into the worker script', async () => {
    const pow = (a: number) => a * a
    const { result, act } = await renderHook(() => useWebWorkerFn((a: number) => pow(a), { localDependencies: [pow] }))

    let p!: Promise<number>
    await act(() => {
      p = result.current.workerFn(4)
    })

    await expect(p).resolves.toBe(16)
  })

  itWorker('terminates and cleans up a running worker on unmount', async () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL')
    const { result, act, unmount } = await renderHook(() => useWebWorkerFn(() => new Promise<number>(() => {})))

    await act(() => {
      void result.current.workerFn()
    })
    await expect.poll(() => result.current.workerStatus).toBe('RUNNING')

    await unmount()
    expect(revoke).toHaveBeenCalled()
    expect(revoke.mock.calls[0][0]).toContain('blob:')

    revoke.mockRestore()
  })

  it('throws when no window is available (SSR guard)', async () => {
    const { result } = await renderHook(() => useWebWorkerFn(() => 42, { window: null as unknown as Window }))

    // synchronous throw, mirroring upstream whose `workerFn` reaches
    // `new Worker` / `new Blob` and throws there too
    expect(() => result.current.workerFn()).toThrow('no window')
    expect(result.current.workerStatus).toBe('PENDING')
  })

  itWorker('imports external dependencies (importScripts) into the worker', async () => {
    // a blob: URL script shares the document origin, so the blob worker can
    // import it; the script defines a global helper used by `fn` at call time
    const depUrl = URL.createObjectURL(new Blob(['self.DOUBLE = (n) => n * 2'], { type: 'text/javascript' }))
    const { result, act } = await renderHook(() => useWebWorkerFn((n: number) => DOUBLE(n), { dependencies: [depUrl] }))

    let p!: Promise<number>
    await act(() => {
      p = result.current.workerFn(21)
    })

    await expect(p).resolves.toBe(42)
  })

  itWorker('handles worker onerror by rejecting with the ErrorEvent', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn(() => new Promise<number>(() => {
      // the promise never settles; an uncaught async throw fires the
      // worker's `error` event, which the hook routes to the pending promise
      setTimeout(() => {
        throw new Error('async boom')
      }, 20)
    })))

    let p!: Promise<unknown>
    await act(() => {
      p = result.current.workerFn()
    })

    await expect(p).rejects.toMatchObject({ message: expect.stringContaining('async boom') })
    await expect.poll(() => result.current.workerStatus).toBe('ERROR')
  })
})
