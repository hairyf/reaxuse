import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useOnline } from './useOnline'

it('useOnline reflects the initial navigator.onLine state', async () => {
  const { result } = await renderHook(() => useOnline())

  expect(result.current).toBe(navigator.onLine)
})

it('useOnline flips on window online/offline events', async () => {
  const { result, act } = await renderHook(() => useOnline())

  await act(() => {
    window.dispatchEvent(new Event('offline'))
  })
  expect(result.current).toBe(false)

  await act(() => {
    window.dispatchEvent(new Event('online'))
  })
  expect(result.current).toBe(true)
})

it('useOnline removes its listeners on unmount', async () => {
  const { result, unmount } = await renderHook(() => useOnline())
  unmount()

  expect(() => {
    window.dispatchEvent(new Event('offline'))
    window.dispatchEvent(new Event('online'))
  }).not.toThrow()

  expect(result.current).toBe(navigator.onLine)
})

it('useOnline supports a custom window option', async () => {
  const listeners: Record<string, Array<() => void>> = {}
  const fakeWindow = {
    navigator: { onLine: false },
    addEventListener: (type: string, listener: () => void) => {
      if (!listeners[type])
        listeners[type] = []
      listeners[type].push(listener)
    },
    removeEventListener: () => {},
  } as unknown as Window

  const { result, act, unmount } = await renderHook(() => useOnline({ window: fakeWindow }))

  expect(result.current).toBe(false)

  await act(() => {
    listeners.online.forEach(listener => listener())
  })
  expect(result.current).toBe(true)

  unmount()
})
