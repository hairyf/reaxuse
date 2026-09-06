import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useMouseInElement } from './useMouseInElement'

function createElement(x: number, y: number, width: number, height: number) {
  const div = document.createElement('div')
  div.style.position = 'relative'
  div.style.left = `${x}px`
  div.style.top = `${y}px`
  div.style.width = `${width}px`
  div.style.height = `${height}px`

  document.body.appendChild(div)
  return div
}

function createInlineElement(x: number, y: number) {
  const parent = createElement(0, 0, 50, 50)
  const span = document.createElement('span')
  span.style.position = 'relative'
  span.style.left = `${x}px`
  span.style.top = `${y}px`
  span.style.lineHeight = '2'
  span.textContent = 'Hello World'

  parent.appendChild(span)
  return span
}

function mockMouseMoveEvent(x: number, y: number) {
  return new MouseEvent('mousemove', { clientX: x, clientY: y })
}

describe('useMouseInElement', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('basic usage - block element', async () => {
    const x = 10
    const y = 10
    const width = 100
    const height = 100
    const target = createElement(x, y, width, height)

    // `x`, `y`, `sourceType` are not fully tested here because they are
    // re-exported from the upstream `useMouse` port.
    const { result, act, unmount } = await renderHook(() => useMouseInElement(target))

    expect(result.current.elementWidth).toBe(width)
    expect(result.current.elementHeight).toBe(height)
    expect(result.current.elementPositionX).toBe(x)
    expect(result.current.elementPositionY).toBe(y)
    expect(result.current.elementX).toBe(-x)
    expect(result.current.elementY).toBe(-y)
    expect(result.current.isOutside).toBe(true)

    const moveX = 20
    const moveY = 20
    await act(() => {
      window.dispatchEvent(mockMouseMoveEvent(moveX, moveY))
    })

    expect(result.current.x).toBe(moveX)
    expect(result.current.y).toBe(moveY)
    expect(result.current.sourceType).toBe('mouse')
    expect(result.current.elementX).toBe(moveX - x)
    expect(result.current.elementY).toBe(moveY - y)
    expect(result.current.isOutside).toBe(false)

    await act(() => {
      result.current.stop()
    })
    await act(() => {
      window.dispatchEvent(mockMouseMoveEvent(0, 0))
    })

    expect(result.current.elementX).toBe(moveX - x)
    expect(result.current.elementY).toBe(moveY - y)
    expect(result.current.isOutside).toBe(false)

    unmount()
  })

  it('basic usage - inline element', async () => {
    const target = createInlineElement(5, 0)
    const { result, act, unmount } = await renderHook(() => useMouseInElement(target))

    expect(result.current.isOutside).toBe(true)

    // move to first line - `Hello`
    await act(() => {
      window.dispatchEvent(mockMouseMoveEvent(10, 10))
    })
    expect(result.current.isOutside).toBe(false)

    // move to gap
    await act(() => {
      window.dispatchEvent(mockMouseMoveEvent(10, 30))
    })
    expect(result.current.isOutside).toBe(true)

    // move to second line - `World`
    await act(() => {
      window.dispatchEvent(mockMouseMoveEvent(10, 40))
    })
    expect(result.current.isOutside).toBe(false)

    // move out
    await act(() => {
      window.dispatchEvent(mockMouseMoveEvent(10, 80))
    })
    expect(result.current.isOutside).toBe(true)

    unmount()
  })

  it('keeps elementX/elementY frozen while outside with handleOutside: false', async () => {
    const target = createElement(10, 10, 100, 100)
    const { result, act, unmount } = await renderHook(() => useMouseInElement(target, { handleOutside: false }))

    await act(() => {
      window.dispatchEvent(mockMouseMoveEvent(20, 20))
    })
    expect(result.current.isOutside).toBe(false)
    expect(result.current.elementX).toBe(10)
    expect(result.current.elementY).toBe(10)

    // move outside — elementX/elementY keep their last inside values
    await act(() => {
      window.dispatchEvent(mockMouseMoveEvent(500, 500))
    })
    expect(result.current.isOutside).toBe(true)
    expect(result.current.elementX).toBe(10)
    expect(result.current.elementY).toBe(10)

    unmount()
  })
})
