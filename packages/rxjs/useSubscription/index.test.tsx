import type { Subscription } from 'rxjs'
import { Subject } from 'rxjs'
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { configure } from 'vitest-browser-react/pure'
import { useSubscription } from '../useSubscription'

/**
 * A stand-in for an `Unsubscribable`: only the `unsubscribe` method is used,
 * so a spy is enough to observe the teardown.
 */
function spySubscription(): { unsubscribe: ReturnType<typeof vi.fn> } {
  return { unsubscribe: vi.fn() }
}

/** Wait for one macrotask so queued microtasks have run. */
function flush(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 10))
}

describe('useSubscription', () => {
  it('should be defined', () => {
    expect(useSubscription).toBeTypeOf('function')
  })

  it('keeps the subscription alive until unmount, then unsubscribes', async () => {
    const subscription = spySubscription()

    const { unmount } = await renderHook(() => useSubscription(subscription))

    expect(subscription.unsubscribe).not.toHaveBeenCalled()

    await unmount()

    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('does not re-unsubscribe on re-render (the argument is not an effect dependency)', async () => {
    const first = spySubscription()
    const second = spySubscription()

    const { rerender, unmount } = await renderHook(
      ({ subscription }: { subscription: { unsubscribe: () => void } } = { subscription: first }) => useSubscription(subscription),
      { initialProps: { subscription: first as { unsubscribe: () => void } } },
    )

    expect(first.unsubscribe).not.toHaveBeenCalled()

    // A fresh identity on a later render must not tear down the live
    // subscription — upstream registers the disposal once, during `setup`.
    await rerender({ subscription: second })

    expect(first.unsubscribe).not.toHaveBeenCalled()
    expect(second.unsubscribe).not.toHaveBeenCalled()

    await unmount()

    expect(first.unsubscribe).toHaveBeenCalledTimes(1)
    expect(second.unsubscribe).not.toHaveBeenCalled()
  })

  it('tears down an actual rxjs Subscription so the subscription closes', async () => {
    const subscription = new Subject<number>().subscribe()

    const { unmount } = await renderHook(() => useSubscription(subscription))

    expect(subscription.closed).toBe(false)

    await unmount()

    expect(subscription.closed).toBe(true)
  })

  it('stops the subscription from emitting once unmounted', async () => {
    const subject = new Subject<number>()
    const received: number[] = []
    const subscription = subject.subscribe(value => received.push(value))

    const { act, unmount } = await renderHook(() => useSubscription(subscription))

    await act(() => {
      subject.next(1)
    })
    expect(received).toEqual([1])

    await unmount()

    // the subject keeps emitting, but nothing is subscribed any more
    await act(() => {
      subject.next(2)
    })
    expect(received).toEqual([1])
  })

  it('still unsubscribes when the teardown runs after the component is gone', async () => {
    // `unsubscribe` may schedule work (e.g. an async observable that updates
    // React state on teardown); deferring it keeps the unmount path free of
    // synchronous side effects.
    const subscription = {
      unsubscribe: vi.fn(() => {
        queueMicrotask(() => {})
      }),
    }

    const { unmount } = await renderHook(() => useSubscription(subscription))

    await unmount()
    await flush()

    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1)
  })

  describe('react StrictMode', () => {
    afterEach(() => {
      configure({ reactStrictMode: false })
    })

    it('unsubscribes on the StrictMode remount cycle (dev effects run twice)', async () => {
      configure({ reactStrictMode: true })

      const subscription = spySubscription()

      const { unmount } = await renderHook(() => useSubscription(subscription))

      // StrictMode's dev mount → cleanup → mount cycle runs this effect's
      // cleanup once …
      expect(subscription.unsubscribe).toHaveBeenCalledTimes(1)

      // … and the real unmount runs it once more. `Unsubscribable.unsubscribe`
      // is idempotent, so the released subscription stays released.
      await unmount()

      expect(subscription.unsubscribe).toHaveBeenCalledTimes(2)
    })
  })

  describe('types', () => {
    it('returns nothing', async () => {
      const subscription = spySubscription()

      const { result } = await renderHook(() => useSubscription(subscription))

      expectTypeOf(result.current).toEqualTypeOf<void>()
      expect(result.current).toBeUndefined()
    })

    it('accepts an Unsubscribable-typed value', async () => {
      const subscription: Subscription = new Subject<number>().subscribe()

      const { unmount } = await renderHook(() => useSubscription(subscription))

      await unmount()

      expect(subscription.closed).toBe(true)
    })
  })
})
