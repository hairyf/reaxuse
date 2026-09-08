import { promiseTimeout } from '@reaxuse/shared'
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { computedAsync } from './computedAsync'

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('computedAsync', () => {
  it('should be defined', () => {
    expect(computedAsync).toBeDefined()
  })

  it('returns the initial state (plain value) until the evaluation settles', async () => {
    const deferred = createDeferred<string>()
    const { result } = await renderHook(() => computedAsync(() => deferred.promise, 'initial'))
    expect(result.current).toBe('initial')
  })

  it('supports a ref-like initial state', async () => {
    const initialState = { current: 'ref-initial' }
    const deferred = createDeferred<string>()
    const { result } = await renderHook(() => computedAsync(() => deferred.promise, initialState))
    expect(result.current).toBe('ref-initial')
    deferred.resolve('resolved')
    await vi.waitFor(() => {
      expect(result.current).toBe('resolved')
    })
    expect(initialState.current).toBe('ref-initial')
  })

  it('resolves the async value', async () => {
    const deferred = createDeferred<string>()
    const { result } = await renderHook(() => computedAsync(() => deferred.promise, 'initial'))
    deferred.resolve('resolved')
    await vi.waitFor(() => {
      expect(result.current).toBe('resolved')
    })
  })

  it('updates the state synchronously for non-Promise return values', async () => {
    const { result } = await renderHook(() => computedAsync(() => 'sync-value', 'initial'))
    expect(result.current).toBe('sync-value')
  })

  it('re-evaluates when deps change', async () => {
    const evaluationCallback = vi.fn(async (term: string) => `lookup:${term}`)
    const { result, rerender } = await renderHook(
      ({ term }: { term: string } = { term: 'a' }) => computedAsync(() => evaluationCallback(term), '', { deps: [term] }),
      { initialProps: { term: 'a' } },
    )
    await vi.waitFor(() => {
      expect(result.current).toBe('lookup:a')
    })
    await rerender({ term: 'b' })
    await vi.waitFor(() => {
      expect(result.current).toBe('lookup:b')
    })
    expect(evaluationCallback).toHaveBeenCalledTimes(2)
  })

  it('discards a stale result when deps change while a promise is pending', async () => {
    const onEvaluating = vi.fn()
    const first = createDeferred<string>()
    const second = createDeferred<string>()
    let call = 0
    const pick = () => {
      call += 1
      if (call === 1)
        return first.promise
      return second.promise
    }
    const { result, rerender } = await renderHook(
      ({ term }: { term: string } = { term: 'a' }) => computedAsync(() => pick(), 'initial', { deps: [term], onEvaluating }),
      { initialProps: { term: 'a' } },
    )
    expect(result.current).toBe('initial')

    // deps change while the first promise is still pending
    await rerender({ term: 'b' })
    await vi.waitFor(() => {
      expect(call).toBe(2)
    })

    // the stale resolution must never land
    first.resolve('stale')
    await promiseTimeout(20)
    expect(result.current).toBe('initial')

    // only the latest evaluation updates the state
    second.resolve('latest')
    await vi.waitFor(() => {
      expect(result.current).toBe('latest')
    })

    // true(start #1) → false(discard) → true(start #2) → false(settle)
    expect(onEvaluating.mock.calls).toEqual([[true], [false], [true], [false]])
  })

  it('invokes onCancel on deps change mid-flight but not on a clean settle', async () => {
    const onCancel = vi.fn()
    const first = createDeferred<string>()
    const second = createDeferred<string>()
    const third = createDeferred<string>()
    let call = 0
    const pick = () => {
      call += 1
      if (call === 1)
        return first.promise
      if (call === 2)
        return second.promise
      return third.promise
    }
    const { result, rerender } = await renderHook(
      ({ term }: { term: string } = { term: 'a' }) => computedAsync((cancel) => {
        cancel(onCancel)
        return pick()
      }, 'initial', { deps: [term] }),
      { initialProps: { term: 'a' } },
    )
    await vi.waitFor(() => {
      expect(call).toBe(1)
    })

    // eval #1 is still pending → the deps change cancels it
    await rerender({ term: 'b' })
    await vi.waitFor(() => {
      expect(call).toBe(2)
    })
    expect(onCancel).toHaveBeenCalledTimes(1)

    // eval #2 settles cleanly
    second.resolve('second')
    await vi.waitFor(() => {
      expect(result.current).toBe('second')
    })

    // eval #2 already finished → its cancel callbacks must not run
    await rerender({ term: 'c' })
    await vi.waitFor(() => {
      expect(call).toBe(3)
    })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('reports the onEvaluating true→false sequence', async () => {
    const onEvaluating = vi.fn()
    const deferred = createDeferred<string>()
    const { result } = await renderHook(() => computedAsync(() => deferred.promise, '', { onEvaluating }))
    expect(result.current).toBe('')
    await vi.waitFor(() => {
      expect(onEvaluating).toHaveBeenCalledTimes(1)
    })
    expect(onEvaluating).toHaveBeenCalledWith(true)

    deferred.resolve('data')
    await vi.waitFor(() => {
      expect(result.current).toBe('data')
    })
    expect(onEvaluating).toHaveBeenCalledTimes(2)
    expect(onEvaluating.mock.calls).toEqual([[true], [false]])
  })

  it('keeps the current state and calls onError on rejection', async () => {
    const onError = vi.fn()
    const error = new Error('lookup failed')
    const { result } = await renderHook(() => computedAsync(
      async () => {
        throw error
      },
      'kept',
      { onError },
    ))
    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error)
    })
    expect(result.current).toBe('kept')
  })

  it('lazy skips the mount evaluation and evaluates on deps change', async () => {
    const evaluationCallback = vi.fn((term: string) => Promise.resolve(`lazy:${term}`))
    const onEvaluating = vi.fn()
    const { result, rerender } = await renderHook(
      ({ term }: { term: string } = { term: 'a' }) => computedAsync(() => evaluationCallback(term), 'initial', { deps: [term], lazy: true, onEvaluating }),
      { initialProps: { term: 'a' } },
    )
    expect(evaluationCallback).not.toHaveBeenCalled()
    expect(result.current).toBe('initial')
    expect(onEvaluating).not.toHaveBeenCalled()

    await rerender({ term: 'b' })
    await vi.waitFor(() => {
      expect(result.current).toBe('lazy:b')
    })
    expect(evaluationCallback).toHaveBeenCalledTimes(1)
  })

  it('unmount discards a late resolution without state updates or warnings', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      const onCancel = vi.fn()
      const onEvaluating = vi.fn()
      const deferred = createDeferred<string>()
      const { result, unmount } = await renderHook(() => computedAsync((cancel) => {
        cancel(onCancel)
        return deferred.promise
      }, 'initial', { onEvaluating }))
      expect(onEvaluating).toHaveBeenCalledWith(true)

      // cancellation runs on unmount while the evaluation is mid-flight
      unmount()
      expect(onCancel).toHaveBeenCalledTimes(1)

      // the late resolution is discarded: no state update, no onEvaluating
      // call, no React warning
      const onEvaluatingCallsAtUnmount = onEvaluating.mock.calls.length
      deferred.resolve('late')
      await promiseTimeout(20)
      expect(result.current).toBe('initial')
      expect(onEvaluating.mock.calls.length).toBe(onEvaluatingCallsAtUnmount)
      expect(consoleError).not.toHaveBeenCalled()
    }
    finally {
      consoleError.mockRestore()
    }
  })
})
