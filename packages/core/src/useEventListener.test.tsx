import type { MockInstance } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useEventListener } from './useEventListener'

describe('useEventListener', () => {
  const options = { capture: true }
  let target: HTMLDivElement
  let removeSpy: MockInstance
  let addSpy: MockInstance

  beforeEach(() => {
    target = document.createElement('div')
    removeSpy = vi.spyOn(target, 'removeEventListener')
    addSpy = vi.spyOn(target, 'addEventListener')
  })

  it('should be defined', () => {
    expect(useEventListener).toBeDefined()
  })

  describe('given both none array', () => {
    const listener = vi.fn()
    const event = 'click'

    beforeEach(() => {
      listener.mockReset()
    })

    it('should add listener', async () => {
      await renderHook(() => useEventListener(target, event, listener, options))

      expect(addSpy).toBeCalledTimes(1)
    })

    it('should trigger listener', async () => {
      await renderHook(() => useEventListener(target, event, listener, options))

      expect(listener).not.toBeCalled()
      target.dispatchEvent(new MouseEvent(event))
      expect(listener).toBeCalledTimes(1)
    })

    it('should remove listener', async () => {
      const { result } = await renderHook(() => useEventListener(target, event, listener, options))

      expect(removeSpy).not.toBeCalled()

      result.current!()

      expect(removeSpy).toBeCalledTimes(1)
      expect(removeSpy).toBeCalledWith(event, listener, options)
    })
  })

  describe('given array of events but single listener', () => {
    const listener = vi.fn()
    const events = ['click', 'scroll', 'blur', 'resize']

    beforeEach(() => {
      listener.mockReset()
    })

    it('should add listener for all events', async () => {
      await renderHook(() => useEventListener(target, events, listener, options))

      events.forEach(event => expect(addSpy).toBeCalledWith(event, listener, options))
    })

    it('should trigger listener with all events', async () => {
      await renderHook(() => useEventListener(target, events, listener, options))

      expect(listener).not.toBeCalled()
      events.forEach((event, index) => {
        target.dispatchEvent(new Event(event))
        expect(listener).toBeCalledTimes(index + 1)
      })
    })

    it('should remove listener with all events', async () => {
      const { result } = await renderHook(() => useEventListener(target, events, listener, options))

      expect(removeSpy).not.toBeCalled()

      result.current!()

      expect(removeSpy).toBeCalledTimes(events.length)
      events.forEach(event => expect(removeSpy).toBeCalledWith(event, listener, options))
    })
  })

  describe('given single event but array of listeners', () => {
    const listeners = [vi.fn(), vi.fn(), vi.fn()]
    const event = 'click'

    beforeEach(() => {
      listeners.forEach(listener => listener.mockReset())
    })

    it('should add all listeners', async () => {
      await renderHook(() => useEventListener(target, event, listeners, options))

      listeners.forEach(listener => expect(addSpy).toBeCalledWith(event, listener, options))
    })

    it('should call all listeners with single click event', async () => {
      await renderHook(() => useEventListener(target, event, listeners, options))

      listeners.forEach(listener => expect(listener).not.toBeCalled())

      target.dispatchEvent(new Event(event))

      listeners.forEach(listener => expect(listener).toBeCalledTimes(1))
    })

    it('should remove listeners', async () => {
      const { result } = await renderHook(() => useEventListener(target, event, listeners, options))

      expect(removeSpy).not.toBeCalled()

      result.current!()

      expect(removeSpy).toBeCalledTimes(listeners.length)
      listeners.forEach(listener => expect(removeSpy).toBeCalledWith(event, listener, options))
    })
  })

  describe('given both array of events and listeners', () => {
    const listeners = [vi.fn(), vi.fn(), vi.fn()]
    const events = ['click', 'scroll', 'blur', 'resize', 'custom-event']

    beforeEach(() => {
      listeners.forEach(listener => listener.mockReset())
    })

    it('should add all listeners for all events', async () => {
      await renderHook(() => useEventListener(target, events, listeners, options))

      listeners.forEach(listener =>
        events.forEach((event) => {
          expect(addSpy).toBeCalledWith(event, listener, options)
        }),
      )
    })

    it('should call all listeners with all events', async () => {
      await renderHook(() => useEventListener(target, events, listeners, options))

      events.forEach((event, index) => {
        target.dispatchEvent(new Event(event))
        listeners.forEach(listener => expect(listener).toBeCalledTimes(index + 1))
      })
    })

    it('should remove all listeners with all events', async () => {
      const { result } = await renderHook(() => useEventListener(target, events, listeners, options))

      result.current!()

      listeners.forEach(listener =>
        events.forEach((event) => {
          expect(removeSpy).toBeCalledWith(event, listener, options)
        }),
      )
    })
  })

  describe('multiple events', () => {
    it('should not listen when target is invalid', async () => {
      const targetRef: { current: HTMLDivElement | null } = { current: document.createElement('div') }
      const listener = vi.fn()
      const { rerender } = await renderHook(() => useEventListener(targetRef, 'click', listener))

      const el = targetRef.current
      targetRef.current = null
      await rerender()
      el!.dispatchEvent(new MouseEvent('click'))

      expect(listener).toHaveBeenCalledTimes(0)
    })

    function getTargetName(useTarget: boolean) {
      return useTarget ? 'element' : 'window'
    }

    function getArgs(useTarget: boolean, targetRef: { current: HTMLDivElement | null }, listener: () => void) {
      return useTarget ? [targetRef, 'click', listener] : ['click', listener]
    }

    function testTarget(useTarget: boolean) {
      it(`should ${getTargetName(useTarget)} listen event`, async () => {
        const targetRef = { current: document.createElement('div') }
        const listener = vi.fn()
        await renderHook(() => {
          // @ts-expect-error mock different args
          return useEventListener(...getArgs(useTarget, targetRef, listener))
        })

        ;(useTarget ? targetRef.current : window)!.dispatchEvent(new MouseEvent('click'))

        expect(listener).toHaveBeenCalledTimes(1)
      })

      it(`should ${getTargetName(useTarget)} manually stop listening event`, async () => {
        const targetRef = { current: document.createElement('div') }
        const listener = vi.fn()
        const { result } = await renderHook(() => {
          // @ts-expect-error mock different args
          return useEventListener(...getArgs(useTarget, targetRef, listener))
        })

        result.current!()

        ;(useTarget ? targetRef.current : window)!.dispatchEvent(new MouseEvent('click'))

        expect(listener).toHaveBeenCalledTimes(0)
      })

      it(`should ${getTargetName(useTarget)} auto stop listening event`, async () => {
        const targetRef = { current: document.createElement('div') }
        const listener = vi.fn()
        const { unmount } = await renderHook(() => {
          // @ts-expect-error mock different args
          return useEventListener(...getArgs(useTarget, targetRef, listener))
        })

        unmount()

        ;(useTarget ? targetRef.current : window)!.dispatchEvent(new MouseEvent('click'))

        expect(listener).toHaveBeenCalledTimes(0)
      })
    }

    testTarget(false)
    testTarget(true)
  })

  describe('useEventListener - multiple targets', () => {
    it('should accept an array ref of DOM elements', async () => {
      const listener = vi.fn()
      const el1 = document.createElement('button')
      const el2 = document.createElement('button')
      const arrayRef = () => [el1, el2]

      await renderHook(() => useEventListener(arrayRef, 'click', listener))

      el1.dispatchEvent(new Event('click'))
      el2.dispatchEvent(new Event('click'))
      expect(listener).toHaveBeenCalledTimes(2)
    })

    it('should accept a getter returning multiple targets', async () => {
      const listener = vi.fn()
      const el1 = document.createElement('div')
      const el2 = document.createElement('div')
      const active = { current: true }

      const { rerender } = await renderHook(() => useEventListener(() => active.current ? [el1, el2] : [], 'mousedown', listener))

      el1.dispatchEvent(new Event('mousedown'))
      el2.dispatchEvent(new Event('mousedown'))
      expect(listener).toHaveBeenCalledTimes(2)

      // disable
      active.current = false
      await rerender()
      el1.dispatchEvent(new Event('mousedown'))
      el2.dispatchEvent(new Event('mousedown'))
      // events should no longer trigger
      expect(listener).toHaveBeenCalledTimes(2)
    })

    it('should accept an array of DOM elements + multiple events', async () => {
      const listener = vi.fn()
      const el1 = document.createElement('button')
      const el2 = document.createElement('button')
      const arrayRef = () => [el1, el2]

      await renderHook(() => useEventListener(arrayRef, ['click', 'hover'], listener))

      el1.dispatchEvent(new Event('click'))
      el2.dispatchEvent(new Event('click'))
      el1.dispatchEvent(new Event('hover'))
      el2.dispatchEvent(new Event('hover'))
      expect(listener).toHaveBeenCalledTimes(4)
    })

    it('should accept a getter returning multiple targets + multiple events', async () => {
      const listener = vi.fn()
      const el1 = document.createElement('div')
      const el2 = document.createElement('div')
      const active = { current: true }

      const { rerender } = await renderHook(() => useEventListener(() => active.current ? [el1, el2] : [], ['mousedown', 'click'], listener))

      el1.dispatchEvent(new Event('mousedown'))
      el2.dispatchEvent(new Event('mousedown'))
      el1.dispatchEvent(new Event('click'))
      el2.dispatchEvent(new Event('click'))
      expect(listener).toHaveBeenCalledTimes(4)

      // disable
      active.current = false
      await rerender()
      el1.dispatchEvent(new Event('mousedown'))
      el2.dispatchEvent(new Event('mousedown'))
      el1.dispatchEvent(new Event('click'))
      el2.dispatchEvent(new Event('click'))
      // events should no longer trigger
      expect(listener).toHaveBeenCalledTimes(4)
    })

    it('should react to target + event + function changes properly', async () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      const el1 = document.createElement('div')
      const el2 = document.createElement('div')
      const els = { current: [el1] }
      const events = { current: ['click'] }
      const listeners = { current: [listener1] }

      const { rerender } = await renderHook(() => useEventListener(els as any, events as any, listeners as any))
      el1.dispatchEvent(new Event('click'))
      els.current = [el2]
      await rerender()
      el1.dispatchEvent(new Event('click'))
      el2.dispatchEvent(new Event('click'))
      events.current = ['mousedown']
      await rerender()
      el1.dispatchEvent(new Event('click'))
      el2.dispatchEvent(new Event('click'))
      el2.dispatchEvent(new Event('mousedown'))
      els.current = [el1, el2]
      events.current = ['click', 'mousedown']
      listeners.current = [listener1, listener2]
      await rerender()
      el1.dispatchEvent(new Event('click'))
      el2.dispatchEvent(new Event('click'))
      el1.dispatchEvent(new Event('mousedown'))
      el2.dispatchEvent(new Event('mousedown'))

      expect(listener1).toHaveBeenCalledTimes(7)
      expect(listener2).toHaveBeenCalledTimes(4)
    })
  })

  it('should auto re-register', async () => {
    const targetRef = { current: undefined as HTMLDivElement | undefined }
    const listener = vi.fn()
    const optionsRef = { current: false as boolean | AddEventListenerOptions }
    const { rerender } = await renderHook(() => useEventListener(targetRef as any, 'click', listener, optionsRef as any))

    const el = document.createElement('div')
    const addSpy = vi.spyOn(el, 'addEventListener')
    const removeSpy = vi.spyOn(el, 'removeEventListener')
    targetRef.current = el
    await rerender()
    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(addSpy).toHaveBeenLastCalledWith('click', listener, false)
    expect(removeSpy).toHaveBeenCalledTimes(0)

    optionsRef.current = true
    await rerender()
    expect(addSpy).toHaveBeenCalledTimes(2)
    expect(addSpy).toHaveBeenLastCalledWith('click', listener, true)
    expect(removeSpy).toHaveBeenCalledTimes(1)
  })

  it('should check document and shadowRoot', async () => {
    const element = document.createElement('div')
    const shadowRoot = element.attachShadow({ mode: 'open' })
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    await renderHook(() => useEventListener(shadowRoot, 'click', listener1))
    await renderHook(() => useEventListener(document, 'click', listener2))

    shadowRoot.dispatchEvent(new Event('click'))
    document.dispatchEvent(new Event('click'))
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
  })

  it('should check multiple shadowRoots + multiple events', async () => {
    const element1 = document.createElement('div')
    const shadowRoot1 = element1.attachShadow({ mode: 'open' })
    const element2 = document.createElement('div')
    const shadowRoot2 = element2.attachShadow({ mode: 'closed' })

    const listener = vi.fn()

    await renderHook(() => useEventListener([element1, element2, shadowRoot1, shadowRoot2] as any, ['click', 'slotchange'], listener))

    shadowRoot1.dispatchEvent(new Event('click'))
    shadowRoot2.dispatchEvent(new Event('click'))

    expect(listener).toHaveBeenCalledTimes(2)

    element1.dispatchEvent(new Event('click'))
    element2.dispatchEvent(new Event('click'))

    expect(listener).toHaveBeenCalledTimes(4)

    shadowRoot1.dispatchEvent(new Event('slotchange'))
    shadowRoot2.dispatchEvent(new Event('slotchange'))

    expect(listener).toHaveBeenCalledTimes(6)
  })
})
