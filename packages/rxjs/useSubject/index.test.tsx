import type { Subscription } from 'rxjs'
import { BehaviorSubject, Subject } from 'rxjs'
import { first, skip } from 'rxjs/operators'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useSubject } from '../useSubject'

/** Wait for one macrotask so the RxJS scheduler (and React) can flush. */
function flush(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 10))
}

describe('useSubject', () => {
  it('should be defined', () => {
    expect(useSubject).toBeTypeOf('function')
  })

  it('should be ref', async () => {
    const subject = new Subject<boolean>()

    const { act, result } = await renderHook(() => useSubject(subject))

    expect(result.current[0]).toBe(undefined)

    await act(() => {
      subject.next(true)
    })

    expect(result.current[0]).toBe(true)
  })

  it('should get value immediately from BehaviorSubject', async () => {
    const subject = new BehaviorSubject(false)

    const { act, result } = await renderHook(() => useSubject(subject))

    expect(result.current[0]).toBe(false)

    await act(() => {
      subject.next(true)
    })

    expect(result.current[0]).toBe(true)
  })

  it('should propagate value change to Subject', async () => {
    const subject = new BehaviorSubject(false)

    // set up before the hook mounts, so `skip(1)` drops only the
    // `BehaviorSubject`'s replay of its current value
    const emitted = new Promise<boolean>((resolve) => {
      subject.pipe(skip(1), first()).subscribe(resolve)
    })

    const { act, result } = await renderHook(() => useSubject(subject))

    await act(() => {
      result.current[1](true)
    })

    await expect(emitted).resolves.toBe(true)
    expect(subject.value).toBe(true)
    expect(result.current[0]).toBe(true)
  })

  describe('setter (React adjustment, hairyf/reaxuse#218)', () => {
    it('writes through the subject instead of a second state', async () => {
      const subject = new BehaviorSubject('initial')
      const received: string[] = []
      const subscription = subject.subscribe(value => received.push(value))

      const { act, result } = await renderHook(() => useSubject(subject))

      expect(received).toEqual(['initial'])

      await act(() => {
        result.current[1]('next value')
      })

      // the write is observable by every other subscriber of the subject
      expect(received).toEqual(['initial', 'next value'])
      expect(subject.value).toBe('next value')
      expect(result.current[0]).toBe('next value')

      subscription.unsubscribe()
    })

    it('forwards the write even when the value is unchanged', async () => {
      const subject = new BehaviorSubject(0)
      const next = vi.spyOn(subject, 'next')

      const { act, result } = await renderHook(() => useSubject(subject))

      expect(result.current[0]).toBe(0)

      await act(() => {
        result.current[1](0)
      })

      expect(next).toHaveBeenCalledWith(0)
    })

    it('lets a later emission overwrite a manual write', async () => {
      const subject = new BehaviorSubject(0)

      const { act, result } = await renderHook(() => useSubject(subject))

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
      const subject = new BehaviorSubject(1)

      const { act, result } = await renderHook(() => useSubject(subject))

      await act(() => {
        result.current[1](previous => (previous ?? 0) + 1)
      })

      expect(result.current[0]).toBe(2)
      expect(subject.value).toBe(2)
    })

    it('composes two functional updates issued in the same tick', async () => {
      const subject = new BehaviorSubject(0)

      const { act, result } = await renderHook(() => useSubject(subject))

      await act(() => {
        result.current[1](previous => (previous ?? 0) + 1)
        result.current[1](previous => (previous ?? 0) + 1)
      })

      expect(result.current[0]).toBe(2)
      expect(subject.value).toBe(2)
    })
  })

  describe('subscription lifecycle', () => {
    it('binds to the first subject — a new identity neither re-subscribes nor re-targets the setter', async () => {
      const first = new BehaviorSubject(0)
      const second = new BehaviorSubject(100)
      const subscribe = vi.spyOn(first, 'subscribe')
      const straySubscription = vi.spyOn(second, 'subscribe')

      const { act, result, rerender } = await renderHook(
        ({ subject }: { subject: BehaviorSubject<number> } = { subject: first }) => useSubject(subject),
        { initialProps: { subject: first } },
      )

      await act(() => rerender({ subject: second }))

      expect(subscribe).toHaveBeenCalledTimes(1)
      expect(straySubscription).not.toHaveBeenCalled()
      expect(result.current[0]).toBe(0)

      await act(() => {
        result.current[1](1)
      })

      // the write still lands in the subject the hook is subscribed to
      expect(first.value).toBe(1)
      expect(second.value).toBe(100)
      expect(result.current[0]).toBe(1)
    })

    it('unsubscribes on unmount', async () => {
      const subject = new BehaviorSubject(0)
      const subscribe = vi.spyOn(subject, 'subscribe')

      const { act, result, unmount } = await renderHook(() => useSubject(subject))

      const subscription = subscribe.mock.results[0].value as Subscription
      expect(subscription.closed).toBe(false)

      await act(() => {
        subject.next(1)
      })
      expect(result.current[0]).toBe(1)

      await unmount()

      expect(subscription.closed).toBe(true)
    })
  })

  describe('error handling', () => {
    it('forwards onError from the subject and keeps the last value', async () => {
      const error = new Error('oops')
      const onError = vi.fn()
      const subject = new BehaviorSubject(0)

      const { act, result } = await renderHook(() => useSubject(subject, { onError }))

      await act(() => {
        subject.error(error)
      })

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(error)
      expect(result.current[0]).toBe(0)
    })

    it('rethrows a subject error asynchronously when no onError is provided', async () => {
      const error = new Error('Unhandled subject error')
      const captured: Event[] = []

      // without `onError` the observer's `error` slot is `undefined`, so RxJS's
      // SafeSubscriber reports the error as unhandled and `hostReportError`
      // rethrows it on a macrotask — the window listener keeps that rethrow from
      // failing the shared browser page (pattern: useObservable / useWebWorker)
      const onWindowError = (e: Event) => {
        e.preventDefault()
        captured.push(e)
      }
      window.addEventListener('error', onWindowError)

      try {
        const subject = new BehaviorSubject(0)

        const { act } = await renderHook(() => useSubject(subject))

        await act(() => {
          subject.error(error)
        })

        // `hostReportError` schedules the rethrow on a macrotask
        await flush()

        expect(captured.length).toBeGreaterThan(0)
      }
      finally {
        window.removeEventListener('error', onWindowError)
      }
    })
  })

  describe('types', () => {
    it('type-level: BehaviorSubject yields a required value, Subject stays optional', async () => {
      const behavior = new BehaviorSubject(0)
      const plain = new Subject<number>()

      const { result } = await renderHook(() => ({
        fromBehavior: useSubject(behavior),
        fromPlain: useSubject(plain),
      }))

      expectTypeOf(result.current.fromBehavior[0]).toEqualTypeOf<number>()
      expectTypeOf(result.current.fromPlain[0]).toEqualTypeOf<number | undefined>()
      expectTypeOf(result.current.fromBehavior[1]).toBeFunction()
    })
  })
})
