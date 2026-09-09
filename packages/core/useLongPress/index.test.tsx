import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useLongPress } from '../useLongPress'

describe('useLongPress', () => {
  let element: HTMLElement
  let elementRef: { current: HTMLElement }
  let pointerdownEvent: PointerEvent
  let pointerupEvent: PointerEvent

  beforeEach(() => {
    vi.useFakeTimers()
    element = document.createElement('div')
    elementRef = { current: element }
    pointerdownEvent = new PointerEvent('pointerdown', { cancelable: true, bubbles: true })
    pointerupEvent = new PointerEvent('pointerup', { cancelable: true, bubbles: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function triggerCallback(isRef: boolean) {
    const onLongPressCallback = vi.fn()
    await renderHook(() => useLongPress(isRef ? elementRef : element, onLongPressCallback))
    element.dispatchEvent(pointerdownEvent)
    expect(onLongPressCallback).toHaveBeenCalledTimes(0)
    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(1)
  }

  async function triggerCallbackWithThreshold(isRef: boolean, threshold = 1000) {
    const onLongPressCallback = vi.fn()
    await renderHook(() => useLongPress(isRef ? elementRef : element, onLongPressCallback, { threshold }))
    // first pointer down
    element.dispatchEvent(pointerdownEvent)

    // wait for 500ms after pointer down
    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(0)

    // pointer up to cancel the pending long press
    element.dispatchEvent(pointerupEvent)

    // wait for 500ms after pointer up
    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(0)

    // another pointer down
    element.dispatchEvent(pointerdownEvent)

    // wait for the configured threshold after pointer down
    await vi.advanceTimersByTimeAsync(threshold)
    expect(onLongPressCallback).toHaveBeenCalledTimes(1)
  }

  async function triggerCallbackWithDistanceThreshold(isRef: boolean) {
    const onLongPressCallback = vi.fn()
    const positionPointerdownEvent = new PointerEvent('pointerdown', { cancelable: true, bubbles: true, clientX: 20, clientY: 20 })
    const moveWithinThresholdEvent = new PointerEvent('pointermove', { cancelable: true, bubbles: true, clientX: 17, clientY: 25 })
    const moveOutsideThresholdEvent = new PointerEvent('pointermove', { cancelable: true, bubbles: true, clientX: 4, clientY: 30 })
    await renderHook(() => useLongPress(isRef ? elementRef : element, onLongPressCallback, { distanceThreshold: 15, threshold: 1000 }))
    // first pointer down
    element.dispatchEvent(positionPointerdownEvent)

    // pointer moves outside the distance threshold — the long press gets canceled
    await vi.advanceTimersByTimeAsync(500)
    element.dispatchEvent(moveOutsideThresholdEvent)
    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(0)

    // pointer up to release
    element.dispatchEvent(pointerupEvent)

    // wait for 500ms after pointer up
    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(0)

    // another pointer down
    element.dispatchEvent(positionPointerdownEvent)

    // pointer moves within the distance threshold — the long press still fires
    await vi.advanceTimersByTimeAsync(500)
    element.dispatchEvent(moveWithinThresholdEvent)
    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(1)
  }

  async function triggerCallbacksOnRelease(isRef: boolean) {
    const onLongPressCallback = vi.fn()
    const onStartCallback = vi.fn()
    const onFinishCallback = vi.fn()
    const onCancelCallback = vi.fn()
    await renderHook(() => useLongPress(
      isRef ? elementRef : element,
      onLongPressCallback,
      { onStart: onStartCallback, onFinish: onFinishCallback, onCancel: onCancelCallback },
    ))

    // first pointer down
    pointerdownEvent = new PointerEvent('pointerdown', { cancelable: true, bubbles: true })
    element.dispatchEvent(pointerdownEvent)
    expect(onStartCallback).toHaveBeenCalledTimes(1)
    expect(onStartCallback).toHaveBeenCalledWith(expect.any(PointerEvent))

    // wait for 250ms after pointer down — not a long press yet
    await vi.advanceTimersByTimeAsync(250)
    expect(onLongPressCallback).toHaveBeenCalledTimes(0)
    expect(onFinishCallback).toHaveBeenCalledTimes(0)
    expect(onCancelCallback).toHaveBeenCalledTimes(0)

    // pointer up before the threshold — gets canceled
    pointerupEvent = new PointerEvent('pointerup', { cancelable: true, bubbles: true })
    element.dispatchEvent(pointerupEvent)
    expect(onFinishCallback).toHaveBeenCalledTimes(0)
    expect(onCancelCallback).toHaveBeenCalledTimes(1)
    expect(onCancelCallback).toHaveBeenCalledWith(expect.any(PointerEvent))

    // wait for 500ms after pointer up
    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(0)

    // another pointer down
    pointerdownEvent = new PointerEvent('pointerdown', { cancelable: true, bubbles: true })
    element.dispatchEvent(pointerdownEvent)

    // wait for 500ms after pointer down — the long press fires
    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(1)

    // pointer up after the long press — gets finished
    pointerupEvent = new PointerEvent('pointerup', { cancelable: true, bubbles: true })
    element.dispatchEvent(pointerupEvent)
    expect(onFinishCallback).toHaveBeenCalledTimes(1)
    expect(onCancelCallback).toHaveBeenCalledTimes(1)
  }

  async function notTriggerCallbackOnPointerCancel(isRef: boolean) {
    const onLongPressCallback = vi.fn()
    const onCancelCallback = vi.fn()
    await renderHook(() => useLongPress(isRef ? elementRef : element, onLongPressCallback, { onCancel: onCancelCallback }))

    pointerdownEvent = new PointerEvent('pointerdown', { cancelable: true, bubbles: true })
    element.dispatchEvent(pointerdownEvent)

    await vi.advanceTimersByTimeAsync(250)
    expect(onLongPressCallback).toHaveBeenCalledTimes(0)

    // the user agent takes the gesture over, e.g. a second pointer starting a pinch
    element.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true }))
    expect(onCancelCallback).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(0)
  }

  async function stopEventListeners(isRef: boolean) {
    const onLongPressCallback = vi.fn()
    let stop: (() => void) | undefined
    await renderHook(() => {
      stop = useLongPress(isRef ? elementRef : element, onLongPressCallback)
    })

    // before calling stop, the callback should be called
    element.dispatchEvent(pointerdownEvent)
    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(1)

    stop?.()

    // after calling stop, the callback should no longer be called
    onLongPressCallback.mockClear()
    element.dispatchEvent(pointerdownEvent)
    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(0)
  }

  async function stopClearsPendingTimer(isRef: boolean) {
    const onLongPressCallback = vi.fn()
    let stop: (() => void) | undefined
    await renderHook(() => {
      stop = useLongPress(isRef ? elementRef : element, onLongPressCallback)
    })

    element.dispatchEvent(pointerdownEvent)
    await vi.advanceTimersByTimeAsync(300)
    expect(onLongPressCallback).toHaveBeenCalledTimes(0)

    stop?.()

    // no pending timer should fire after being stopped
    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(0)
  }

  async function onlyTriggerWithMatchingModifiers(isRef: boolean) {
    const onLongPressCallback = vi.fn()
    await renderHook(() => useLongPress(isRef ? elementRef : element, onLongPressCallback, { modifiers: { ctrl: true } }))

    const withoutModifier = new PointerEvent('pointerdown', { cancelable: true, bubbles: true, ctrlKey: false })
    element.dispatchEvent(withoutModifier)
    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(0)

    const withModifier = new PointerEvent('pointerdown', { cancelable: true, bubbles: true, ctrlKey: true })
    element.dispatchEvent(withModifier)
    await vi.advanceTimersByTimeAsync(500)
    expect(onLongPressCallback).toHaveBeenCalledTimes(1)
  }

  function suites(isRef: boolean) {
    describe('given no options', () => {
      it('should trigger longpress after 500ms', () => triggerCallback(isRef))
    })

    describe('given options', () => {
      it('should trigger longpress after options.threshold ms', () => triggerCallbackWithThreshold(isRef))

      it('should trigger longpress if the pointer is moved within the distance threshold', () => triggerCallbackWithDistanceThreshold(isRef))

      it('should trigger onStart / onFinish / onCancel on press and release', () => triggerCallbacksOnRelease(isRef))

      it('should not trigger longpress when the pointer is canceled', () => notTriggerCallbackOnPointerCancel(isRef))

      it('should remove event listeners after being stopped', () => stopEventListeners(isRef))

      it('should clear the pending timer after being stopped', () => stopClearsPendingTimer(isRef))

      it('should only trigger longpress when the options.modifiers match', () => onlyTriggerWithMatchingModifiers(isRef))
    })
  }

  it('should be defined', () => {
    expect(useLongPress).toBeDefined()
  })

  describe('given argument is ref-like', () => suites(true))

  describe('given argument is an element', () => suites(false))
})
