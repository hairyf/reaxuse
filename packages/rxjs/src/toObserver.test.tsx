import type { ObserverTarget } from './toObserver'
import { useRef, useState } from 'react'
import { interval, Observable, of } from 'rxjs'
import { take, toArray } from 'rxjs/operators'
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { toObserver } from './toObserver'

describe('toObserver', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be defined', () => {
    expect(toObserver).toBeDefined()
  })

  it('writes every emission into a ref-like `{ current }` target', () => {
    const target = { current: 0 }

    of(1, 2, 3).subscribe(toObserver(target))

    // every emission is written, so the last one wins on the sink
    expect(target.current).toBe(3)
  })

  it('writes every emission into a setter target', () => {
    const received: number[] = []

    of(1, 2, 3).subscribe(toObserver<number>(value => received.push(value)))

    expect(received).toEqual([1, 2, 3])
  })

  it('writes each interval emission into the ref-like target', () => {
    vi.useFakeTimers()

    const target = { current: -1 }
    const values: number[] = []
    const observer = toObserver(target)
    const subscription = interval(100)
      .pipe(take(3))
      .subscribe({
        next: (value) => {
          observer.next!(value)
          values.push(target.current)
        },
      })

    vi.advanceTimersByTime(350)
    subscription.unsubscribe()

    expect(values).toEqual([0, 1, 2])
    expect(target.current).toBe(2)
  })

  it('writes synchronously — the target already holds the value inside `next`', () => {
    const target = { current: 0 }
    const seenInsideNext: number[] = []
    let sawComplete = false

    const observer = toObserver(target)

    of(7, 8).subscribe({
      next: (value) => {
        observer.next!(value)
        seenInsideNext.push(target.current)
      },
      complete: () => {
        sawComplete = true
      },
    })

    // the write lands before the surrounding `next` handler returns, i.e.
    // strictly before `complete` fires
    expect(seenInsideNext).toEqual([7, 8])
    expect(target.current).toBe(8)
    expect(sawComplete).toBe(true)
  })

  it('returns an observer with ONLY `next` — no `error`/`complete`', () => {
    const refLike = toObserver({ current: 0 })
    const setter = toObserver<number>(() => {})

    expect(Object.keys(refLike)).toEqual(['next'])
    expect(Object.keys(setter)).toEqual(['next'])
    expect(refLike).not.toHaveProperty('error')
    expect(refLike).not.toHaveProperty('complete')
    expect(setter).not.toHaveProperty('error')
    expect(setter).not.toHaveProperty('complete')
  })

  it('accepts a real `useRef` via `renderHook` (no re-render, latest value readable)', async () => {
    vi.useFakeTimers()

    const { act, result } = await renderHook(() => {
      const count = useRef(0)
      const [observer] = useState(() => toObserver(count))
      const [subscription] = useState(() => interval(100).pipe(take(3)).subscribe(observer))

      return { count, subscription }
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350)
    })

    // a `useRef` write never re-renders, so the container object is stable and
    // `current` carries the latest emission
    expect(result.current.count.current).toBe(2)
    result.current.subscription.unsubscribe()
  })

  it('a `useState` setter target re-renders with each emission', async () => {
    vi.useFakeTimers()

    const { act, result } = await renderHook(() => {
      const [count, setCount] = useState(-1)
      const [subscription] = useState(() => interval(100).pipe(take(3)).subscribe(toObserver(setCount)))

      return { count, subscription }
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(350)
    })

    expect(result.current.count).toBe(2)
    result.current.subscription.unsubscribe()
  })

  it('never writes when the source only errors', () => {
    const target = { current: 42 }
    const errors: unknown[] = []

    const observer = toObserver(target)

    new Observable<number>((subscriber) => {
      subscriber.error(new Error('boom'))
    }).subscribe({
      next: observer.next,
      error: error => errors.push(error),
    })

    expect(target.current).toBe(42)
    expect(errors).toHaveLength(1)
    expect((errors[0] as Error).message).toBe('boom')
  })

  it('collects the whole stream through `toArray` when the target is a setter', () => {
    const received: number[] = []

    of(1, 2, 3)
      .pipe(toArray())
      .subscribe(toObserver<number[]>(value => received.push(...value)))

    expect(received).toEqual([1, 2, 3])
  })

  it('supports non-numeric payloads', () => {
    const target: { current: string } = { current: 'initial' }

    of('a', 'b').subscribe(toObserver(target))

    expect(target.current).toBe('b')
  })

  it('type-level: `ObserverTarget<T>` accepts `{ current: T }` and `(value: T) => void`', () => {
    expectTypeOf<{ current: number }>().toMatchTypeOf<ObserverTarget<number>>()
    expectTypeOf<(value: number) => void>().toMatchTypeOf<ObserverTarget<number>>()
    // a plain value is deliberately NOT a valid target
    expectTypeOf<number>().not.toMatchTypeOf<ObserverTarget<number>>()
  })
})
