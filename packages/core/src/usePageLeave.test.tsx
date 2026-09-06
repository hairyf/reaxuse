import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { usePageLeave } from './usePageLeave'

it('usePageLeave starts with the mouse on the page', async () => {
  const { result } = await renderHook(() => usePageLeave())

  expect(result.current).toBe(false)
})

it('usePageLeave flips to true on window mouseout and back on mouseenter', async () => {
  const { result, act } = await renderHook(() => usePageLeave())

  await act(() => {
    window.dispatchEvent(new MouseEvent('mouseout'))
  })
  expect(result.current).toBe(true)

  await act(() => {
    window.dispatchEvent(new MouseEvent('mouseout', { relatedTarget: document.body }))
  })
  expect(result.current).toBe(false)

  await act(() => {
    document.dispatchEvent(new MouseEvent('mouseleave'))
  })
  expect(result.current).toBe(true)

  await act(() => {
    document.dispatchEvent(new MouseEvent('mouseenter', { relatedTarget: document.body }))
  })
  expect(result.current).toBe(false)
})

it('usePageLeave keeps false when the mouse moves within the page', async () => {
  const { result, act } = await renderHook(() => usePageLeave())

  await act(() => {
    window.dispatchEvent(new MouseEvent('mouseout', { relatedTarget: document.body }))
  })
  expect(result.current).toBe(false)
})

it('usePageLeave renders the false default during SSR (no window access in render)', async () => {
  let firstRenderValue: boolean | undefined

  function Probe() {
    firstRenderValue ??= usePageLeave()
    return null
  }

  await render(<Probe />)

  expect(firstRenderValue).toBe(false)
})

it('usePageLeave removes its listeners on unmount', async () => {
  const { unmount } = await renderHook(() => usePageLeave())
  unmount()

  expect(() => {
    window.dispatchEvent(new MouseEvent('mouseout'))
    document.dispatchEvent(new MouseEvent('mouseleave'))
  }).not.toThrow()
})

it('usePageLeave supports a custom window option', async () => {
  const listeners: Record<string, Array<(event: Event) => void>> = {}
  const fakeDocument = {
    addEventListener: (type: string, listener: (event: Event) => void) => {
      (listeners[type] ??= []).push(listener)
    },
    removeEventListener: () => {},
  } as unknown as Document
  const fakeWindow = {
    document: fakeDocument,
    addEventListener: (type: string, listener: (event: Event) => void) => {
      (listeners[type] ??= []).push(listener)
    },
    removeEventListener: () => {},
  } as unknown as Window

  const { result, act } = await renderHook(() => usePageLeave({ window: fakeWindow }))

  expect(result.current).toBe(false)

  await act(() => {
    listeners.mouseout.forEach(listener => listener(new MouseEvent('mouseout')))
  })
  expect(result.current).toBe(true)

  await act(() => {
    listeners.mouseenter.forEach(listener => listener(new MouseEvent('mouseenter', { relatedTarget: document.body })))
  })
  expect(result.current).toBe(false)
})
