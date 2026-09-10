import type { OnCleanup } from '../useWatchExtractedObservable'
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs'
import { endWith, map, tap } from 'rxjs/operators'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useExtractedObservable } from '../useExtractedObservable'

/**
 * Wrap a `Subject` in an `Observable` whose teardown is observable — the
 * returned function runs when the subscription is unsubscribed.
 *
 * `Observable` must stay a *value* import from `rxjs`: with a type-only
 * import the reference below would fall through to the browser's native
 * `Observable` global (Chromium ≥ 138), whose native `Subscriber.next`
 * reaching RxJS's `SafeSubscriber.__tryOrUnsub` throws `Illegal invocation`.
 *
 * Keep the returned `Observable` identity stable across renders (store it in a
 * variable, not inline in the render callback): the source identity is an
 * effect dependency, an inline identity re-extracts on every render.
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

/** Wait for one macrotask so the RxJS scheduler (and React) can flush. */
function flush(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 10))
}

describe('useExtractedObservable', () => {
  it('should be defined', () => {
    expect(useExtractedObservable).toBeTypeOf('function')
  })

  describe('when no options are provided', () => {
    it('should call the extractor immediately', async () => {
      const obs = new Subject<number>()
      const extractor = vi.fn((lastValue: number) => obs.pipe(endWith(lastValue)))

      await renderHook(() => useExtractedObservable(42, extractor))

      expect(extractor).toHaveBeenCalledOnce()
      // the resolved source value, then `onCleanup` — upstream's `oldValue`
      // argument is dropped (React keeps no previous-value tracking)
      expect(extractor.mock.lastCall![0]).toBe(42)
      expect(extractor.mock.lastCall).toHaveLength(2)
    })
  })

  describe('when initialValue is not provided', () => {
    it('should have undefined as a value until the observable emits a value', async () => {
      const obs = new Subject<number>()

      const { act, result } = await renderHook(
        () => useExtractedObservable(42, lastValue => obs.pipe(endWith(lastValue))),
      )

      expect(result.current).toBeUndefined()

      await act(() => {
        obs.next(23)
      })

      expect(result.current).toBe(23)
    })
  })

  describe('when initialValue is provided', () => {
    it('should have initialValue as a value until the observable emits a value', async () => {
      const obs = new Subject<number>()

      const { act, result } = await renderHook(
        () => useExtractedObservable(42, () => obs, { initialValue: 13 }),
      )

      expect(result.current).toBe(13)

      await act(() => {
        obs.next(23)
      })

      expect(result.current).toBe(23)
    })

    it('should hold the first emitted value if the observable emits values immediately on subscription', async () => {
      const obs = new BehaviorSubject(16)

      const { result } = await renderHook(
        () => useExtractedObservable(42, () => obs, { initialValue: 13 }),
      )

      expect(result.current).toBe(16)
    })

    it('only applies to the first render — a later source change keeps the last emission', async () => {
      const first = new Subject<number>()
      const second = new Subject<number>()

      const { act, result, rerender } = await renderHook(
        ({ value }: { value: Subject<number> } = { value: first }) => useExtractedObservable(value, source => source, { initialValue: 13 }),
        { initialProps: { value: first } },
      )

      expect(result.current).toBe(13)

      await act(() => {
        first.next(23)
      })
      expect(result.current).toBe(23)

      await act(() => rerender({ value: second }))

      // the fresh run does not fall back to `initialValue` (upstream's
      // `shallowRef(initialValue)` is only constructed once)
      expect(result.current).toBe(23)
    })
  })

  describe('when onError is provided', () => {
    it('calls onError when an observable emits an error', async () => {
      const error = new Error('Odd number')
      const onError = vi.fn()

      const extractor = (num: number) => of(num).pipe(
        tap((n: number) => {
          if (n % 2 === 1)
            throw error
        }),
      )

      const { act, result, rerender } = await renderHook(
        ({ num }: { num: number } = { num: 0 }) => useExtractedObservable(num, extractor, { onError }),
        { initialProps: { num: 0 } },
      )

      expect(onError).not.toHaveBeenCalled()
      expect(result.current).toBe(0)

      await act(() => rerender({ num: 1 }))

      expect(onError).toHaveBeenCalledOnce()
      expect(onError).toHaveBeenCalledWith(error)
      // an error emits nothing, so the previous value is kept
      expect(result.current).toBe(0)
    })

    it('doesn\'t call onError when the observable doesn\'t emit an error', async () => {
      const onError = vi.fn()

      const { act, rerender } = await renderHook(
        ({ items }: { items: number[] } = { items: [1, 2] }) => useExtractedObservable(items, (arr: number[]) => of(...arr), { onError }),
        { initialProps: { items: [1, 2] } },
      )

      expect(onError).not.toHaveBeenCalled()

      await act(() => rerender({ items: [42] }))

      expect(onError).not.toHaveBeenCalled()
    })

    it('rethrows an observable error asynchronously when no onError is provided', async () => {
      const error = new Error('Unhandled odd number')
      const captured: Event[] = []

      // without `onError` the observer's `error` slot is `undefined`, so RxJS's
      // SafeSubscriber reports the error as unhandled and `hostReportError`
      // rethrows it on a macrotask — the window listener keeps that rethrow from
      // failing the shared browser page (pattern: useWebWorker / useBattery)
      const onWindowError = (e: Event) => {
        e.preventDefault()
        captured.push(e)
      }
      window.addEventListener('error', onWindowError)

      try {
        const { act, rerender } = await renderHook(
          ({ num }: { num: number } = { num: 0 }) => useExtractedObservable(num, (n: number) => (n % 2 === 1 ? throwError(error) : of(n))),
          { initialProps: { num: 0 } },
        )

        expect(captured).toHaveLength(0)

        await act(() => rerender({ num: 1 }))

        // `hostReportError` schedules the rethrow on a macrotask
        await flush()

        expect(captured.length).toBeGreaterThan(0)
      }
      finally {
        window.removeEventListener('error', onWindowError)
      }
    })
  })

  describe('when onComplete is provided', () => {
    it('calls onComplete when an observable completes', async () => {
      const onComplete = vi.fn()

      const { act, result, rerender } = await renderHook(
        ({ items }: { items: number[] } = { items: [19, 42] }) => useExtractedObservable(items, (arr: number[]) => of(...arr), { onComplete }),
        { initialProps: { items: [19, 42] } },
      )

      expect(onComplete).toHaveBeenCalledOnce()
      expect(result.current).toBe(42)

      await act(() => rerender({ items: [7] }))

      expect(onComplete).toHaveBeenCalledTimes(2)
      expect(result.current).toBe(7)
    })

    it('doesn\'t call onComplete if the watched observable has changed before it could complete', async () => {
      const first = new Subject<number>()
      const second = new Subject<number>()
      const onComplete = vi.fn()

      const { act, rerender } = await renderHook(
        ({ value }: { value: Subject<number> } = { value: first }) => useExtractedObservable(value, source => source, { onComplete }),
        { initialProps: { value: first } },
      )

      await act(() => rerender({ value: second }))

      // the previous run is torn down, so its completion is never reported
      await act(() => {
        first.complete()
      })
      expect(onComplete).not.toHaveBeenCalled()

      await act(() => {
        second.complete()
      })
      expect(onComplete).toHaveBeenCalledOnce()
    })
  })

  it('properly uses an array of watch sources', async () => {
    const { act, result, rerender } = await renderHook(
      ({ pair }: { pair: [string, string] } = { pair: ['abc', 'def'] }) => useExtractedObservable(pair, ([abc, def]) => of(`${abc}${def}`)),
      { initialProps: { pair: ['abc', 'def'] as [string, string] } },
    )

    expect(result.current).toBe('abcdef')

    await act(() => rerender({ pair: ['abc', 'abc'] }))

    expect(result.current).toBe('abcabc')
  })

  it('properly uses an object of watch sources', async () => {
    const { act, result, rerender } = await renderHook(
      ({ source }: { source: { x: number, y: number, z: number } } = { source: { x: 0, y: 0, z: 0 } }) =>
        useExtractedObservable(source, obj => of(`x: ${obj.x}, y: ${obj.y}, z: ${obj.z}`)),
      { initialProps: { source: { x: 0, y: 0, z: 0 } } },
    )

    expect(result.current).toBe('x: 0, y: 0, z: 0')

    await act(() => rerender({ source: { x: 42, y: 0, z: 0 } }))
    expect(result.current).toBe('x: 42, y: 0, z: 0')

    await act(() => rerender({ source: { x: 0, y: 1, z: 0 } }))
    expect(result.current).toBe('x: 0, y: 1, z: 0')

    await act(() => rerender({ source: { x: 1, y: 0, z: 1 } }))
    expect(result.current).toBe('x: 1, y: 0, z: 1')
  })

  describe('subscription lifecycle', () => {
    it('re-extracts when deps change even though the source identity is stable', async () => {
      const teardown = vi.fn()
      const subject = new Subject<number>()
      const source = tracked(subject, teardown)
      const extractor = vi.fn((value: Observable<number>) => value)

      const { act, rerender } = await renderHook(
        ({ term }: { term: string } = { term: 'a' }) => useExtractedObservable(source, extractor, { deps: [term] }),
        { initialProps: { term: 'a' } },
      )

      expect(extractor).toHaveBeenCalledTimes(1)

      // identical source identity and deps → no re-extract
      await act(() => rerender({ term: 'a' }))
      expect(extractor).toHaveBeenCalledTimes(1)

      // the React substitute for Vue's reactive tracking: an in-place mutation
      // of the source object is re-extracted through `deps`
      await act(() => rerender({ term: 'b' }))
      expect(extractor).toHaveBeenCalledTimes(2)
      expect(teardown).toHaveBeenCalledTimes(1)
    })

    it('reads the latest extractor on the next run without re-subscribing on an inline identity', async () => {
      const subject = new Subject<number>()
      let extractCalls = 0

      const { act, result, rerender } = await renderHook(
        ({ factor, term }: { factor: number, term: string } = { factor: 1, term: 'a' }) => useExtractedObservable(42, () => {
          extractCalls++
          return subject.pipe(map(n => n * factor))
        }, { deps: [term] }),
        { initialProps: { factor: 1, term: 'a' } },
      )

      expect(extractCalls).toBe(1)

      await act(() => rerender({ factor: 2, term: 'a' }))

      // an inline extractor identity never re-subscribes…
      expect(extractCalls).toBe(1)

      await act(() => {
        subject.next(2)
      })

      // …so the live pipeline is still the one built on the first run
      expect(result.current).toBe(2)

      // a deps change re-extracts, and the newest extractor closure is used
      // (the effect reads it through a latest-value ref — no stale closure)
      await act(() => rerender({ factor: 5, term: 'b' }))
      expect(extractCalls).toBe(2)

      await act(() => {
        subject.next(2)
      })
      expect(result.current).toBe(10)
    })

    it('subscribes to nothing when the source is nullish and drops the previous subscription', async () => {
      const teardown = vi.fn()
      const subject = new Subject<number>()
      const source = tracked(subject, teardown)
      const extractor = vi.fn((value: Observable<number>) => value)

      const { act, result, rerender } = await renderHook(
        ({ value }: { value: Observable<number> | null } = { value: source }) => useExtractedObservable(value, extractor),
        { initialProps: { value: source as Observable<number> | null } },
      )

      expect(extractor).toHaveBeenCalledTimes(1)

      await act(() => rerender({ value: null }))

      expect(teardown).toHaveBeenCalledTimes(1)
      expect(extractor).toHaveBeenCalledTimes(1)

      await act(() => {
        subject.next(1)
      })

      expect(result.current).toBeUndefined()
    })

    it('does not let a torn-down run write into the state', async () => {
      const first = new Subject<number>()
      const second = new Subject<number>()

      const { act, result, rerender } = await renderHook(
        ({ value }: { value: Subject<number> } = { value: first }) => useExtractedObservable(value, source => source),
        { initialProps: { value: first } },
      )

      await act(() => {
        first.next(1)
      })
      expect(result.current).toBe(1)

      await act(() => rerender({ value: second }))
      await act(() => {
        second.next(2)
      })
      expect(result.current).toBe(2)

      // the previous subscription is closed — its source can no longer
      // overwrite the state (stale-closure guard)
      await act(() => {
        first.next(3)
      })
      expect(result.current).toBe(2)
    })

    it('runs onCleanup before the next run and on unmount', async () => {
      const events: string[] = []
      const subject = new Subject<number>()
      const source = tracked(subject, () => events.push('teardown'))
      const nextSource = tracked(subject, () => events.push('teardown-next'))

      const extractor = (value: Observable<number>, onCleanup: OnCleanup) => {
        events.push('extract')
        onCleanup(() => events.push('cleanup'))
        return value
      }

      const { act, rerender, unmount } = await renderHook(
        ({ value }: { value: Observable<number> } = { value: source }) => useExtractedObservable(value, extractor),
        { initialProps: { value: source } },
      )

      expect(events).toEqual(['extract'])

      await act(() => rerender({ value: nextSource }))

      // the previous run's cleanup fires before the next extractor call, and
      // before the previous subscription is unsubscribed (upstream ordering)
      expect(events).toEqual(['extract', 'cleanup', 'teardown', 'extract'])

      await unmount()

      expect(events).toEqual(['extract', 'cleanup', 'teardown', 'extract', 'cleanup', 'teardown-next'])
    })

    it('unsubscribes on unmount', async () => {
      const teardown = vi.fn()
      const subject = new Subject<number>()
      const source = tracked(subject, teardown)

      const { act, result, unmount } = await renderHook(() => useExtractedObservable(source, value => value))

      await act(() => {
        subject.next(1)
      })
      expect(result.current).toBe(1)
      expect(teardown).not.toHaveBeenCalled()

      await unmount()

      expect(teardown).toHaveBeenCalledTimes(1)

      // the subject keeps emitting, but nothing is subscribed any more
      await act(() => {
        subject.next(2)
      })
      expect(teardown).toHaveBeenCalledTimes(1)
    })
  })

  describe('types', () => {
    it('type-level: the value stays optional without initialValue and is required with it', async () => {
      const source = of(1)

      const { result } = await renderHook(() => ({
        withoutInitial: useExtractedObservable(42, () => source),
        withInitial: useExtractedObservable(42, () => source, { initialValue: 0 }),
      }))

      expectTypeOf(result.current.withoutInitial).toEqualTypeOf<number | undefined>()
      expectTypeOf(result.current.withInitial).toEqualTypeOf<number>()
    })
  })
})
