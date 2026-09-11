import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs'
import { delay } from 'rxjs/operators'
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useObservable } from '../useObservable'

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

/** Wait for one macrotask so the RxJS scheduler (and React) can flush. */
function flush(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 10))
}

/**
 * Used for this test to examine optional chaining and typescript type computation.
 */
interface TestPerson {
  fullName: string
}

describe('useObservable', () => {
  /**
   * Emits nothing until a value is pushed into it. React's `renderHook` awaits
   * the mount effect, so the upstream `delayedEmissionStream` (`delay(0)`) has
   * already emitted by the time it resolves — the "before the stream has
   * emitted" assertions therefore use a source that stays silent.
   */
  let silentStream: Subject<TestPerson>
  let testDataSource: BehaviorSubject<TestPerson>
  let delayedEmissionStream: Observable<TestPerson>

  beforeEach(() => {
    silentStream = new Subject<TestPerson>()
    testDataSource = new BehaviorSubject<TestPerson>({ fullName: 'Mario Mario' })
    delayedEmissionStream = testDataSource.pipe(delay(0))
  })

  it('should be defined', () => {
    expect(useObservable).toBeTypeOf('function')
  })

  describe('when initialValue is not provided', () => {
    it('should set the value to undefined before the stream has emitted', async () => {
      const { result } = await renderHook(() => useObservable(silentStream))

      expect(result.current[0]).toBe(undefined)
    })

    it('should set the value from the data emitted on the stream', async () => {
      const { act, result } = await renderHook(() => useObservable(delayedEmissionStream))

      // wait for next tick, allowing RxJS to emit the value
      await act(flush)

      // Notice optional chaining operator required
      expect(result.current[0]?.fullName).toEqual('Mario Mario')
    })
  })

  describe('when initialValue is provided', () => {
    it('should set the value to initialData before the stream has emitted', async () => {
      const { result } = await renderHook(
        () => useObservable(silentStream, { initialValue: { fullName: 'I don\'t know yet!' } }),
      )

      // Notice how we do not need the optional chaining to access fullName
      expect(result.current[0].fullName).toBe('I don\'t know yet!')
    })

    it('should set the value from the data emitted on the stream', async () => {
      const { act, result } = await renderHook(
        () => useObservable(delayedEmissionStream, { initialValue: { fullName: 'I don\'t know yet!' } }),
      )

      // wait for next tick, allowing RxJS to emit the value
      await act(flush)

      expect(result.current[0].fullName).toBe('Mario Mario')
    })
  })

  describe('setter (React adjustment, hairyf/reause#174)', () => {
    it('writes through the returned setter', async () => {
      const subject = new Subject<number>()

      const { act, result } = await renderHook(() => useObservable(subject, { initialValue: 0 }))

      expect(result.current[0]).toBe(0)

      await act(() => {
        result.current[1](42)
      })

      expect(result.current[0]).toBe(42)
    })

    it('lets a later emission overwrite a manual write', async () => {
      const subject = new Subject<number>()

      const { act, result } = await renderHook(() => useObservable(subject, { initialValue: 0 }))

      await act(() => {
        result.current[1](42)
      })
      expect(result.current[0]).toBe(42)

      await act(() => {
        subject.next(7)
      })

      expect(result.current[0]).toBe(7)
    })

    it('accepts a functional update like a `useState` setter', async () => {
      const subject = new Subject<number>()

      const { act, result } = await renderHook(() => useObservable(subject, { initialValue: 1 }))

      await act(() => {
        result.current[1](previous => previous + 1)
      })

      expect(result.current[0]).toBe(2)
    })
  })

  describe('subscription lifecycle', () => {
    it('subscribes once — a new observable identity does not re-subscribe', async () => {
      const teardown = vi.fn()
      const subject = new Subject<number>()
      const first = tracked(subject, teardown)

      const { act, result, rerender } = await renderHook(
        ({ stream }: { stream: Observable<number> } = { stream: first }) => useObservable(stream),
        { initialProps: { stream: first } },
      )

      // a fresh identity on a later render (e.g. the documented inline
      // `interval(1000)`) must not tear down the live subscription
      await act(() => rerender({ stream: subject.asObservable() }))

      expect(teardown).not.toHaveBeenCalled()

      await act(() => {
        subject.next(1)
      })
      expect(result.current[0]).toBe(1)
    })

    it('unsubscribes on unmount', async () => {
      const teardown = vi.fn()
      const subject = new Subject<number>()

      const { act, result, unmount } = await renderHook(
        () => useObservable(tracked(subject, teardown)),
      )

      await act(() => {
        subject.next(1)
      })
      expect(result.current[0]).toBe(1)
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

  describe('error handling', () => {
    it('forwards onError from a failing observable and keeps the initial value', async () => {
      const error = new Error('oops')
      const onError = vi.fn()

      const { result } = await renderHook(
        () => useObservable(throwError(error), { initialValue: 0, onError }),
      )

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(error)
      expect(result.current[0]).toBe(0)
    })

    it('rethrows an observable error asynchronously when no onError is provided', async () => {
      const error = new Error('Unhandled observable error')
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
        const { result } = await renderHook(() => useObservable(throwError(error)))

        // `hostReportError` schedules the rethrow on a macrotask
        await flush()

        expect(captured.length).toBeGreaterThan(0)
        expect(result.current[0]).toBe(undefined)
      }
      finally {
        window.removeEventListener('error', onWindowError)
      }
    })
  })

  describe('types', () => {
    it('type-level: the value stays optional without initialValue and required with it', async () => {
      const source = of(1)

      const { result } = await renderHook(() => ({
        withoutInitial: useObservable(source),
        withInitial: useObservable(source, { initialValue: 0 }),
      }))

      expectTypeOf(result.current.withoutInitial[0]).toEqualTypeOf<number | undefined>()
      expectTypeOf(result.current.withInitial[0]).toEqualTypeOf<number>()
      expectTypeOf(result.current.withInitial[1]).toBeFunction()
    })
  })
})
