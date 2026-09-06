import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useWebWorkerFn } from './useWebWorkerFn'

// Upstream ships no tests for useWebWorkerFn. These use real dedicated
// workers spawned from blob: URLs and expect.poll for the async
// postMessage/onmessage round-trips, mirroring useWebWorker.test.tsx. The
// heavy worker functions busy-wait inside the worker thread so RUNNING stays
// observable without blocking the main thread. External `dependencies`
// (importScripts) are not exercised: they need a reachable script URL.

describe('useWebWorkerFn', () => {
  it('returns an object mirroring the upstream return shape', async () => {
    const { result } = await renderHook(() => useWebWorkerFn(() => 42))

    expect(result.current.workerStatus).toBe('PENDING')
    expect(typeof result.current.workerFn).toBe('function')
    expect(typeof result.current.workerTerminate).toBe('function')
  })

  it('runs the function in a worker and resolves with the result', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn((a: number, b: number) => a + b))

    let p!: Promise<number>
    await act(() => {
      p = result.current.workerFn(2, 3)
    })

    await expect(p).resolves.toBe(5)
  })

  it('passes the fn arguments through to the worker', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn((items: number[]) => items.map(n => n * 2)))

    let p!: Promise<number[]>
    await act(() => {
      p = result.current.workerFn([1, 2, 3])
    })

    await expect(p).resolves.toEqual([2, 4, 6])
  })

  it('tracks workerStatus from RUNNING to SUCCESS', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn(() => {
      // busy-wait inside the worker thread so RUNNING stays observable
      const start = Date.now()
      while (Date.now() - start < 150) {
        // noop
      }
      return 42
    }))

    await act(() => {
      void result.current.workerFn()
    })

    await expect.poll(() => result.current.workerStatus).toBe('RUNNING')
    await expect.poll(() => result.current.workerStatus).toBe('SUCCESS')
  })

  it('allows a new workerFn call after the previous one finished', async () => {
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

  it('rejects when the worker function throws and sets status to ERROR', async () => {
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

  it('rejects a second workerFn call while one is running', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn(() => {
      // busy-wait inside the worker thread so the first call stays RUNNING
      const start = Date.now()
      while (Date.now() - start < 300) {
        // noop
      }
      return 1
    }))

    await act(() => {
      void result.current.workerFn()
    })
    await expect.poll(() => result.current.workerStatus).toBe('RUNNING')

    const second = result.current.workerFn()
    await expect(second).rejects.toBeUndefined()

    // the first call still resolves after its worker completes
    await expect.poll(() => result.current.workerStatus).toBe('SUCCESS')
  })

  it('terminates the running worker and allows a new call afterwards', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn(() => {
      // busy-wait inside the worker thread so the first call stays RUNNING
      const start = Date.now()
      while (Date.now() - start < 200) {
        // noop
      }
      return 42
    }))

    await act(() => {
      void result.current.workerFn()
    })
    await expect.poll(() => result.current.workerStatus).toBe('RUNNING')

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

  it('sets status to TIMEOUT_EXPIRED when the worker exceeds the timeout', async () => {
    const { result, act } = await renderHook(() => useWebWorkerFn(() => new Promise<number>(() => {}), { timeout: 100 }))

    await act(() => {
      void result.current.workerFn()
    })

    await expect.poll(() => result.current.workerStatus).toBe('TIMEOUT_EXPIRED')
  })

  it('injects local dependencies into the worker script', async () => {
    const pow = (a: number) => a * a
    const { result, act } = await renderHook(() => useWebWorkerFn((a: number) => pow(a), { localDependencies: [pow] }))

    let p!: Promise<number>
    await act(() => {
      p = result.current.workerFn(4)
    })

    await expect(p).resolves.toBe(16)
  })

  it('terminates and cleans up a running worker on unmount', async () => {
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

  it('rejects when no window is available (SSR guard)', async () => {
    const { result } = await renderHook(() => useWebWorkerFn(() => 42, { window: null as unknown as Window }))

    await expect(result.current.workerFn()).rejects.toThrow('no window')
    expect(result.current.workerStatus).toBe('PENDING')
  })
})
