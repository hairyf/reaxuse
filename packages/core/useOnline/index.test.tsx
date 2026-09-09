import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useOnline } from '../useOnline'

it('useOnline reflects the initial navigator.onLine state', async () => {
  const { result } = await renderHook(() => useOnline())

  expect(result.current).toBe(navigator.onLine)
})

it('useOnline reflects an offline navigator on the very first render (no online flash)', async () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'onLine')
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false })

  try {
    const rendered: boolean[] = []
    function Probe() {
      rendered.push(useOnline())
      return null
    }

    await render(<Probe />)

    expect(rendered[0]).toBe(false)
  }
  finally {
    if (original)
      Object.defineProperty(navigator, 'onLine', original)
    else
      Reflect.deleteProperty(navigator, 'onLine')
  }
})

it('useOnline keeps the online default when the navigator has no onLine support', async () => {
  const listeners: Record<string, Array<() => void>> = {}
  const fakeWindow = {
    navigator: {},
    addEventListener: (type: string, listener: () => void) => {
      if (!listeners[type])
        listeners[type] = []
      listeners[type].push(listener)
    },
    removeEventListener: () => {},
  } as unknown as Window

  const { result, unmount } = await renderHook(() => useOnline({ window: fakeWindow }))

  expect(result.current).toBe(true)

  unmount()
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
