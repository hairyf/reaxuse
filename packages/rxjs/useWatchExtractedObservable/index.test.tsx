import type { OnCleanup } from '../useWatchExtractedObservable'
import { Observable, of, Subject, throwError } from 'rxjs'
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useWatchExtractedObservable } from '../useWatchExtractedObservable'

interface Wrapper {
  obs$: Observable<number>
}

/**
 * Wrap a `Subject` in an `Observable` whose teardown is observable — the
 * returned function runs when the subscription is unsubscribed.
 *
 * `Observable` must stay a *value* import from `rxjs`: with a type-only
 * import the reference below would fall through to the browser's native
 * `Observable` global (Chromium ≥ 138), whose native `Subscriber.next`
 * reaching RxJS's `SafeSubscriber.__tryOrUnsub` throws `Illegal invocation`.
 */
function tracked(subject: Subject<number>, onTeardown: () => void): Observable<number> {
  return new Observable<number>((subscriber) => {
    const subscription = subject.subscribe(subscriber)
    return () => {
      onTeardown()
      subscription.unsubscribe()
    }
  })
}

describe('useWatchExtractedObservable', () => {
  it('should be defined', () => {
    expect(useWatchExtractedObservable).toBeTypeOf('function')
  })

  it('calls neither the extractor nor the callback when the source is nullish', async () => {
    const extractor = vi.fn((wrapper: Wrapper) => wrapper.obs$)
    const callback = vi.fn()

    const { rerender } = await renderHook(
      ({ wrapper }: { wrapper: Wrapper | null } = { wrapper: null }) => useWatchExtractedObservable(wrapper, extractor, callback),
      { initialProps: { wrapper: null as Wrapper | null } },
    )

    expect(extractor).not.toHaveBeenCalled()
    expect(callback).not.toHaveBeenCalled()

    await rerender({ wrapper: null })

    expect(extractor).not.toHaveBeenCalled()
  })

  it('emits the observable values through the callback', async () => {
    const subject = new Subject<number>()
    const wrapper: Wrapper = { obs$: subject.asObservable() }
    const extractor = vi.fn((value: Wrapper) => value.obs$)
    const callback = vi.fn()

    const { act } = await renderHook(() => useWatchExtractedObservable(wrapper, extractor, callback))

    expect(extractor).toHaveBeenCalledTimes(1)
    // `(value, onCleanup)` — upstream's `oldValue` argument is dropped
    expect(extractor.mock.calls[0]).toHaveLength(2)
    expect(callback).not.toHaveBeenCalled()

    await act(() => {
      subject.next(1)
    })
    await act(() => {
      subject.next(2)
    })

    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenNthCalledWith(1, 1)
    expect(callback).toHaveBeenNthCalledWith(2, 2)
  })

  it('extracts once the source becomes non-nullish', async () => {
    const subject = new Subject<number>()
    const extractor = vi.fn((value: Wrapper) => value.obs$)
    const callback = vi.fn()

    const { act, rerender } = await renderHook(
      (props: { source: Wrapper | undefined }) => useWatchExtractedObservable(props.source, extractor, callback),
      { initialProps: { source: undefined as Wrapper | undefined } },
    )

    expect(extractor).not.toHaveBeenCalled()

    await act(() => rerender({ source: { obs$: subject.asObservable() } }))

    expect(extractor).toHaveBeenCalledTimes(1)

    await act(() => {
      subject.next(0)
    })
    expect(callback).toHaveBeenCalledWith(0)
  })

  it('re-extracts and unsubscribes the previous subscription when the source identity changes', async () => {
    const firstTeardown = vi.fn()
    const secondTeardown = vi.fn()
    const first = new Subject<number>()
    const second = new Subject<number>()
    const firstWrapper: Wrapper = { obs$: tracked(first, firstTeardown) }
    const secondWrapper: Wrapper = { obs$: tracked(second, secondTeardown) }
    const extractor = vi.fn((value: Wrapper) => value.obs$)
    const callback = vi.fn()

    const { act, rerender } = await renderHook(
      ({ wrapper }: { wrapper: Wrapper } = { wrapper: firstWrapper }) => useWatchExtractedObservable(wrapper, extractor, callback),
      { initialProps: { wrapper: firstWrapper } },
    )

    await act(() => {
      first.next(1)
    })
    expect(callback).toHaveBeenCalledWith(1)
    expect(firstTeardown).not.toHaveBeenCalled()

    await act(() => rerender({ wrapper: secondWrapper }))

    expect(extractor).toHaveBeenCalledTimes(2)
    expect(firstTeardown).toHaveBeenCalledTimes(1)

    // the old observable no longer reaches the callback
    await act(() => {
      first.next(2)
    })
    expect(callback).toHaveBeenCalledTimes(1)

    await act(() => {
      second.next(3)
    })
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenLastCalledWith(3)
  })

  it('drops the previous subscription when the source becomes nullish', async () => {
    const teardown = vi.fn()
    const subject = new Subject<number>()
    const wrapper: Wrapper = { obs$: tracked(subject, teardown) }
    const extractor = vi.fn((value: Wrapper) => value.obs$)
    const callback = vi.fn()

    const { act, rerender } = await renderHook(
      ({ value }: { value: Wrapper | null } = { value: null }) => useWatchExtractedObservable(value, extractor, callback),
      { initialProps: { value: wrapper as Wrapper | null } },
    )

    expect(extractor).toHaveBeenCalledTimes(1)

    await act(() => rerender({ value: null }))

    expect(teardown).toHaveBeenCalledTimes(1)
    expect(extractor).toHaveBeenCalledTimes(1)

    await act(() => {
      subject.next(1)
    })
    expect(callback).not.toHaveBeenCalled()
  })

  it('re-extracts when deps change even though the source identity is stable', async () => {
    const teardown = vi.fn()
    const subject = new Subject<number>()
    const wrapper: Wrapper = { obs$: tracked(subject, teardown) }
    const extractor = vi.fn((value: Wrapper) => value.obs$)
    const callback = vi.fn()

    const { act, rerender } = await renderHook(
      ({ term }: { term: string } = { term: 'a' }) => useWatchExtractedObservable(wrapper, extractor, callback, { deps: [term] }),
      { initialProps: { term: 'a' } },
    )

    expect(extractor).toHaveBeenCalledTimes(1)

    // identical deps → no re-extract
    await act(() => rerender({ term: 'a' }))
    expect(extractor).toHaveBeenCalledTimes(1)

    await act(() => rerender({ term: 'b' }))
    expect(extractor).toHaveBeenCalledTimes(2)
    expect(teardown).toHaveBeenCalledTimes(1)
  })

  it('re-extracts when any entry of a multi-entry deps list changes', async () => {
    const subject = new Subject<number>()
    const wrapper: Wrapper = { obs$: subject.asObservable() }
    const extractor = vi.fn((value: Wrapper) => value.obs$)

    const { act, rerender } = await renderHook(
      ({ x, y }: { x: number, y: number } = { x: 0, y: 0 }) => useWatchExtractedObservable(wrapper, extractor, () => {}, { deps: [x, y] }),
      { initialProps: { x: 0, y: 0 } },
    )

    expect(extractor).toHaveBeenCalledTimes(1)

    await act(() => rerender({ x: 0, y: 0 }))
    expect(extractor).toHaveBeenCalledTimes(1)

    await act(() => rerender({ x: 42, y: 0 }))
    expect(extractor).toHaveBeenCalledTimes(2)

    await act(() => rerender({ x: 42, y: 1 }))
    expect(extractor).toHaveBeenCalledTimes(3)
  })

  it('reads the latest extractor and callback without re-subscribing', async () => {
    const subject = new Subject<number>()
    const wrapper: Wrapper = { obs$: subject.asObservable() }
    const extractor = vi.fn((value: Wrapper) => value.obs$)
    const firstCallback = vi.fn()
    const secondCallback = vi.fn()

    const { act, rerender } = await renderHook(
      ({ callback }: { callback: (snapshot: number) => void } = { callback: firstCallback }) => useWatchExtractedObservable(wrapper, extractor, callback),
      { initialProps: { callback: firstCallback } },
    )

    await act(() => rerender({ callback: secondCallback }))

    // inline identities never re-subscribe — only the source / deps do
    expect(extractor).toHaveBeenCalledTimes(1)

    await act(() => {
      subject.next(5)
    })

    expect(firstCallback).not.toHaveBeenCalled()
    expect(secondCallback).toHaveBeenCalledWith(5)
  })

  it('forwards onError from a failing observable', async () => {
    const error = new Error('Odd number')
    const callback = vi.fn()
    const onError = vi.fn()

    const { act, rerender } = await renderHook(
      ({ num }: { num: number } = { num: 0 }) => useWatchExtractedObservable(
        num,
        (value: number) => (value % 2 === 1 ? throwError(error) : of(value)),
        callback,
        { deps: [num], onError },
      ),
      { initialProps: { num: 0 } },
    )

    expect(callback).toHaveBeenCalledWith(0)
    expect(onError).not.toHaveBeenCalled()

    await act(() => rerender({ num: 1 }))

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(error)
    // an error emits nothing
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('forwards onComplete when the observable completes', async () => {
    const callback = vi.fn()
    const onComplete = vi.fn()
    const onError = vi.fn()

    const { act, rerender } = await renderHook(
      ({ items }: { items: number[] } = { items: [1, 2] }) => useWatchExtractedObservable(
        items,
        (value: number[]) => of(...value),
        callback,
        { deps: [items], onComplete, onError },
      ),
      { initialProps: { items: [1, 2] } },
    )

    expect(callback).toHaveBeenCalledTimes(2)
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()

    await act(() => rerender({ items: [1, 3, 6] }))

    expect(callback).toHaveBeenCalledTimes(5)
    expect(onComplete).toHaveBeenCalledTimes(2)
  })

  it('does not call onComplete when the previous run is torn down before completing', async () => {
    const first = new Subject<number>()
    const second = new Subject<number>()
    const firstWrapper: Wrapper = { obs$: first.asObservable() }
    const secondWrapper: Wrapper = { obs$: second.asObservable() }
    const onComplete = vi.fn()

    const { act, rerender } = await renderHook(
      ({ wrapper }: { wrapper: Wrapper } = { wrapper: firstWrapper }) => useWatchExtractedObservable(wrapper, (value: Wrapper) => value.obs$, () => {}, { onComplete }),
      { initialProps: { wrapper: firstWrapper } },
    )

    await act(() => rerender({ wrapper: secondWrapper }))
    expect(onComplete).not.toHaveBeenCalled()

    await act(() => {
      second.complete()
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('runs onCleanup before the next run and on unmount', async () => {
    const events: string[] = []
    const subject = new Subject<number>()
    const wrapper: Wrapper = { obs$: tracked(subject, () => events.push('teardown')) }
    const nextWrapper: Wrapper = { obs$: tracked(subject, () => events.push('teardown-next')) }
    const extractor = (value: Wrapper, onCleanup: OnCleanup) => {
      events.push('extract')
      onCleanup(() => events.push('cleanup'))
      return value.obs$
    }

    const { act, rerender, unmount } = await renderHook(
      ({ value }: { value: Wrapper } = { value: wrapper }) => useWatchExtractedObservable(value, extractor, () => {}),
      { initialProps: { value: wrapper } },
    )

    expect(events).toEqual(['extract'])

    await act(() => rerender({ value: nextWrapper }))

    // the previous run's cleanup fires before the next extractor call, and
    // before the previous subscription is unsubscribed (upstream ordering)
    expect(events).toEqual(['extract', 'cleanup', 'teardown', 'extract'])

    await unmount()

    expect(events).toEqual(['extract', 'cleanup', 'teardown', 'extract', 'cleanup', 'teardown-next'])
  })

  it('stop() unsubscribes idempotently and stays stopped', async () => {
    const teardown = vi.fn()
    const cleanup = vi.fn()
    const subject = new Subject<number>()
    const wrapper: Wrapper = { obs$: tracked(subject, teardown) }
    const extractor = vi.fn((value: Wrapper, onCleanup: OnCleanup) => {
      onCleanup(cleanup)
      return value.obs$
    })
    const callback = vi.fn()

    const { result, act, rerender } = await renderHook(
      ({ term }: { term: string } = { term: 'a' }) => useWatchExtractedObservable(wrapper, extractor, callback, { deps: [term] }),
      { initialProps: { term: 'a' } },
    )

    const stop = result.current.stop

    await act(() => rerender({ term: 'b' }))
    // stable identity across renders (§2B object return, `useCallback`)
    expect(result.current.stop).toBe(stop)
    expect(extractor).toHaveBeenCalledTimes(2)
    expect(teardown).toHaveBeenCalledTimes(1)

    await act(() => stop())
    expect(teardown).toHaveBeenCalledTimes(2)
    expect(cleanup).toHaveBeenCalledTimes(2)

    // idempotent
    await act(() => stop())
    expect(teardown).toHaveBeenCalledTimes(2)
    expect(cleanup).toHaveBeenCalledTimes(2)

    await act(() => {
      subject.next(1)
    })
    expect(callback).not.toHaveBeenCalled()

    // permanent — upstream `WatchHandle` parity
    await act(() => rerender({ term: 'c' }))
    expect(extractor).toHaveBeenCalledTimes(2)
  })

  it('unsubscribes on unmount', async () => {
    const teardown = vi.fn()
    const cleanup = vi.fn()
    const subject = new Subject<number>()
    const wrapper: Wrapper = { obs$: tracked(subject, teardown) }
    const extractor = (value: Wrapper, onCleanup: OnCleanup) => {
      onCleanup(cleanup)
      return value.obs$
    }
    const callback = vi.fn()

    const { act, unmount } = await renderHook(() => useWatchExtractedObservable(wrapper, extractor, callback))

    await act(() => {
      subject.next(1)
    })
    expect(callback).toHaveBeenCalledWith(1)

    await unmount()

    expect(teardown).toHaveBeenCalledTimes(1)
    expect(cleanup).toHaveBeenCalledTimes(1)

    await act(() => {
      subject.next(2)
    })
    expect(callback).toHaveBeenCalledTimes(1)
  })
})
