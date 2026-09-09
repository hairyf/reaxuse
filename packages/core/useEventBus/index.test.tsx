import { beforeEach, describe, expect, it, vi } from 'vitest'
import { events, useEventBus } from '../useEventBus'

describe('useEventBus', () => {
  const emptyMap = new Map()

  beforeEach(() => {
    events.clear()
  })

  it('should be defined', () => {
    expect(useEventBus).toBeDefined()
  })

  it('on event and off listener', () => {
    const { on, off } = useEventBus<number>('foo')
    const listener = vi.fn()
    on(listener)
    off(listener)
    expect(events).toEqual(emptyMap)
  })

  it('on event', () => {
    let event = false
    const { emit, on, reset } = useEventBus<boolean>('on-event')
    on((_event) => {
      event = _event
    })
    emit(true)
    expect(event).toBe(true)
    reset()
    expect(events).toEqual(emptyMap)
  })

  it('once event', () => {
    const { once, emit, reset } = useEventBus<number>('foo')
    const listener = vi.fn()
    once(listener)
    emit()
    emit()
    emit()
    expect(listener).toBeCalledTimes(1)
    reset()
    expect(events).toEqual(emptyMap)
  })

  it('not off non-exist listener', () => {
    const bus1 = useEventBus<number>('foo')
    const bus2 = useEventBus<number>('bar')
    const listener = vi.fn()

    bus1.on(listener)
    bus2.off(listener)

    expect(events.get('foo')).toBeDefined()
    expect(events.get('bar')).toBeUndefined()
  })

  it('not off other events listener', () => {
    const bus1 = useEventBus<number>('foo')
    const bus2 = useEventBus<number>('bar')
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    bus1.on(listener1)
    bus2.on(listener2)
    bus1.off(listener2)
    bus2.off(listener1)

    expect(events.get('foo')).toBeDefined()
    expect(events.get('bar')).toBeDefined()
  })

  it('useEventBus off event', () => {
    const { emit, on, reset } = useEventBus<number>('useEventBus-off')
    const listener = vi.fn()
    on(listener)

    emit()
    reset()

    on(listener)

    emit()
    reset()

    expect(listener).toBeCalledTimes(2)
    expect(events).toEqual(emptyMap)
  })

  it('event off event', () => {
    const event1 = useEventBus<number>('event-off-1')
    const event2 = useEventBus<number>('event-off-2')
    const listener = vi.fn()
    event2.on(listener)
    event1.emit() // 1
    event2.emit() // 1

    event1.reset()

    event2.on(listener)
    event1.emit() // 2
    event2.emit() // 2

    event1.reset()
    event2.reset()

    expect(listener).toBeCalledTimes(2)
    expect(events).toEqual(emptyMap)
  })

  it('unsubscribe returned by on removes the listener', () => {
    // Upstream relies on Vue effect-scope disposal (setup unmount). React has
    // no scope disposal, so this mirrors the guarantee that each registered
    // listener can be torn down via the returned unsubscribe function.
    const { on } = useEventBus('setup-unmount')
    const unsubscribers = [
      on(() => {}),
      on(() => {}),
      on(() => {}),
      on(() => {}),
      on(() => {}),
    ]
    expect(events).not.toEqual(emptyMap)
    unsubscribers.forEach(unsubscribe => unsubscribe())
    expect(events).toEqual(emptyMap)
  })

  it('should work with payload', () => {
    const { on, emit } = useEventBus<'inc' | 'dec', number>('counter')
    const listener = vi.fn()
    on((event, payload) => listener(event, payload))
    emit('inc', 3)
    expect(listener).toHaveBeenCalledWith('inc', 3)
    emit('dec', 1)
    expect(listener).toHaveBeenCalledWith('dec', 1)
  })

  it('the same key, the same listener, will only be triggered once', () => {
    const listener = vi.fn()
    const { on, emit, off } = useEventBus<'inc' | 'dec', number>('counter')
    on(listener)
    on(listener)
    emit()
    off(listener)
    expect(listener).toBeCalledTimes(1)
    expect(events).toEqual(emptyMap)
  })
})
