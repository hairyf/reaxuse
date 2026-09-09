import { expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useDocumentVisibility } from '../useDocumentVisibility'

class MockDocument extends EventTarget {
  visibilityState: DocumentVisibilityState = 'hidden'
}

it('useDocumentVisibility reflects the initial document.visibilityState', async () => {
  const { result } = await renderHook(() => useDocumentVisibility())

  expect(result.current).toBe(document.visibilityState)
})

it('useDocumentVisibility updates on visibilitychange events', async () => {
  const mockDocument = new MockDocument()
  mockDocument.visibilityState = 'visible'

  const { result, act } = await renderHook(() => useDocumentVisibility({ document: mockDocument as unknown as Document }))

  expect(result.current).toBe('visible')

  mockDocument.visibilityState = 'hidden'
  await act(() => {
    mockDocument.dispatchEvent(new Event('visibilitychange'))
  })
  expect(result.current).toBe('hidden')

  mockDocument.visibilityState = 'visible'
  await act(() => {
    mockDocument.dispatchEvent(new Event('visibilitychange'))
  })
  expect(result.current).toBe('visible')
})

it('useDocumentVisibility is SSR-safe and defaults to visible without a document', async () => {
  const { result } = await renderHook(() => useDocumentVisibility({ document: null }))

  expect(result.current).toBe('visible')
})

it('useDocumentVisibility removes its listeners on unmount', async () => {
  const mockDocument = new MockDocument()
  // React 18 silently no-ops setState after unmount, so a leaked listener
  // would pass a state-only assertion — spy on the removal itself instead
  const removeSpy = vi.spyOn(mockDocument, 'removeEventListener')
  const { unmount } = await renderHook(() => useDocumentVisibility({ document: mockDocument as unknown as Document }))

  expect(removeSpy).not.toHaveBeenCalled()

  await unmount()

  // the cleanup must have removed the visibilitychange listener
  expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
})
