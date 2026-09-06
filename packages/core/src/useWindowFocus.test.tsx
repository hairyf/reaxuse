import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useWindowFocus } from './useWindowFocus'

it('useWindowFocus reflects the initial document.hasFocus() state', async () => {
  const { result } = await renderHook(() => useWindowFocus())

  expect(result.current).toBe(document.hasFocus())
})

it('useWindowFocus flips on window focus/blur events', async () => {
  const { result, act } = await renderHook(() => useWindowFocus())

  await act(() => {
    window.dispatchEvent(new Event('blur'))
  })
  expect(result.current).toBe(false)

  await act(() => {
    window.dispatchEvent(new Event('focus'))
  })
  expect(result.current).toBe(true)
})

it('useWindowFocus removes its listeners on unmount', async () => {
  const { result, unmount } = await renderHook(() => useWindowFocus())
  unmount()

  expect(() => {
    window.dispatchEvent(new Event('blur'))
    window.dispatchEvent(new Event('focus'))
  }).not.toThrow()

  expect(result.current).toBe(document.hasFocus())
})

it('useWindowFocus supports a custom window option', async () => {
  const listeners: Record<string, Array<() => void>> = {}
  const fakeWindow = {
    document: { hasFocus: () => false },
    addEventListener: (type: string, listener: () => void) => {
      if (!listeners[type])
        listeners[type] = []
      listeners[type].push(listener)
    },
    removeEventListener: () => {},
  } as unknown as Window

  const { result, act, unmount } = await renderHook(() => useWindowFocus({ window: fakeWindow }))

  expect(result.current).toBe(false)

  await act(() => {
    listeners.focus.forEach(listener => listener())
  })
  expect(result.current).toBe(true)

  await act(() => {
    listeners.blur.forEach(listener => listener())
  })
  expect(result.current).toBe(false)

  unmount()
})
