import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { usePointer } from './usePointer'

function createPointerEvent(type: string, init: PointerEventInit = {}) {
  return new PointerEvent(type, { bubbles: true, pointerType: 'mouse', ...init })
}

describe('usePointer', () => {
  it('returns the default state before any pointer event', async () => {
    const { result } = await renderHook(() => usePointer())

    expect(result.current).toEqual({
      x: 0,
      y: 0,
      pointerId: 0,
      pressure: 0,
      tiltX: 0,
      tiltY: 0,
      width: 0,
      height: 0,
      twist: 0,
      pointerType: null,
      isInside: false,
    })
  })

  it('updates the full state on pointermove', async () => {
    const { result, act } = await renderHook(() => usePointer())

    await act(() => {
      window.dispatchEvent(createPointerEvent('pointermove', {
        clientX: 120,
        clientY: 80,
        pointerId: 7,
        pressure: 0.5,
        pointerType: 'mouse',
        tiltX: 3,
        tiltY: 4,
        width: 10,
        height: 10,
        twist: 45,
      }))
    })

    await expect.poll(() => result.current.x).toBe(120)
    expect(result.current.y).toBe(80)
    expect(result.current.pointerId).toBe(7)
    expect(result.current.pressure).toBe(0.5)
    expect(result.current.pointerType).toBe('mouse')
    expect(result.current.tiltX).toBe(3)
    expect(result.current.tiltY).toBe(4)
    expect(result.current.width).toBe(10)
    expect(result.current.height).toBe(10)
    expect(result.current.twist).toBe(45)
    expect(result.current.isInside).toBe(true)
  })

  it('updates the state on pointerup', async () => {
    const { result, act } = await renderHook(() => usePointer())

    await act(() => {
      window.dispatchEvent(createPointerEvent('pointerup', {
        clientX: 15,
        clientY: 25,
        pointerId: 3,
        pressure: 0,
      }))
    })

    await expect.poll(() => result.current.x).toBe(15)
    expect(result.current.y).toBe(25)
    expect(result.current.pointerId).toBe(3)
    expect(result.current.pressure).toBe(0)
  })

  it('sets isInside true on pointerdown and resets it on pointercancel', async () => {
    const { result, act } = await renderHook(() => usePointer())

    await act(() => {
      window.dispatchEvent(createPointerEvent('pointerdown'))
    })
    await expect.poll(() => result.current.isInside).toBe(true)

    await act(() => {
      window.dispatchEvent(createPointerEvent('pointercancel'))
    })
    await expect.poll(() => result.current.isInside).toBe(false)
  })

  it('resets isInside on pointerleave', async () => {
    const { result, act } = await renderHook(() => usePointer())

    await act(() => {
      window.dispatchEvent(createPointerEvent('pointerdown'))
    })
    await expect.poll(() => result.current.isInside).toBe(true)

    await act(() => {
      window.dispatchEvent(createPointerEvent('pointerleave'))
    })
    await expect.poll(() => result.current.isInside).toBe(false)
  })

  it('filters pointer events by pointerTypes but still marks isInside', async () => {
    const { result, act } = await renderHook(() => usePointer({ pointerTypes: ['mouse'] }))

    await act(() => {
      window.dispatchEvent(createPointerEvent('pointerdown', {
        pointerType: 'touch',
        clientX: 5,
        clientY: 6,
        pointerId: 2,
      }))
    })
    await expect.poll(() => result.current.isInside).toBe(true)
    expect(result.current.x).toBe(0)
    expect(result.current.pointerId).toBe(0)

    await act(() => {
      window.dispatchEvent(createPointerEvent('pointermove', {
        pointerType: 'mouse',
        clientX: 42,
        clientY: 43,
      }))
    })
    await expect.poll(() => result.current.x).toBe(42)
    expect(result.current.pointerId).not.toBe(2)
  })

  it('supports the initialValue option', async () => {
    const { result } = await renderHook(() => usePointer({
      initialValue: { x: 11, y: 22, pointerType: 'pen' },
    }))

    expect(result.current.x).toBe(11)
    expect(result.current.y).toBe(22)
    expect(result.current.pointerType).toBe('pen')
    expect(result.current.pressure).toBe(0)
    expect(result.current.isInside).toBe(false)
  })

  it('attaches its listeners to a custom target element', async () => {
    const element = document.createElement('div')
    document.body.appendChild(element)

    const { result, act, unmount } = await renderHook(() => usePointer({ target: element }))

    await act(() => {
      element.dispatchEvent(createPointerEvent('pointerdown'))
    })
    await expect.poll(() => result.current.isInside).toBe(true)

    await act(() => {
      element.dispatchEvent(createPointerEvent('pointerleave'))
    })
    await expect.poll(() => result.current.isInside).toBe(false)

    unmount()
    element.remove()
  })

  it('re-subscribes when the target option changes', async () => {
    const first = document.createElement('div')
    const second = document.createElement('div')
    document.body.append(first, second)

    const { result, act, rerender, unmount } = await renderHook(
      (props?: { target?: EventTarget }) => usePointer(props),
      { initialProps: { target: first } },
    )

    await act(() => {
      first.dispatchEvent(createPointerEvent('pointermove', { clientX: 1, clientY: 2 }))
    })
    await expect.poll(() => result.current.x).toBe(1)

    await rerender({ target: second })

    await act(() => {
      first.dispatchEvent(createPointerEvent('pointermove', { clientX: 33, clientY: 34 }))
    })
    expect(result.current.x).toBe(1)

    await act(() => {
      second.dispatchEvent(createPointerEvent('pointermove', { clientX: 8, clientY: 9 }))
    })
    await expect.poll(() => result.current.x).toBe(8)

    unmount()
    first.remove()
    second.remove()
  })

  it('removes its listeners on unmount', async () => {
    const { result, act, unmount } = await renderHook(() => usePointer())
    unmount()

    await act(() => {
      window.dispatchEvent(createPointerEvent('pointermove', { clientX: 999, clientY: 999 }))
    })

    expect(result.current.x).toBe(0)
    expect(result.current.y).toBe(0)
    expect(result.current.isInside).toBe(false)
  })
})
