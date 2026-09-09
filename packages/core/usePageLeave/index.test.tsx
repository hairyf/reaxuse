import { renderToString } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { usePageLeave } from '../usePageLeave'

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

  // real server renderer: effects never run, so only the render-time value
  // (false) is observable
  await renderToString(<Probe />)

  expect(firstRenderValue).toBe(false)
})

it('usePageLeave removes its listeners on unmount', async () => {
  const { unmount } = await renderHook(() => usePageLeave())

  // the cleanup must actually detach all three listeners — `mouseout` lives
  // on the window, `mouseleave`/`mouseenter` on the document (proves removal
  // instead of relying on a silent no-op)
  const windowRemoveSpy = vi.spyOn(window, 'removeEventListener')
  const documentRemoveSpy = vi.spyOn(document, 'removeEventListener')
  unmount()

  expect(windowRemoveSpy).toHaveBeenCalledWith('mouseout', expect.any(Function))
  expect(documentRemoveSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function))
  expect(documentRemoveSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function))
  windowRemoveSpy.mockRestore()
  documentRemoveSpy.mockRestore()
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
