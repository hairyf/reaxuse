import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useTextSelection } from './useTextSelection'

// Mirrors upstream `source/vueuse/packages/core/useTextSelection/index.browser.test.ts`:
// synthetic selection via native Selection APIs + a manual `selectionchange`
// dispatch (the hook does not listen on window, so no async waiting is needed
// beyond `expect.poll`).
describe('useTextSelection', () => {
  let node: HTMLElement

  beforeEach(() => {
    node = document.createElement('div')
    node.id = 'test'
    node.textContent = 'Hello World'
    document.body.appendChild(node)
  })

  afterEach(() => {
    node.remove()
    window.getSelection()?.removeAllRanges()
  })

  const selectHelloWorldNode = () => {
    window.getSelection()?.selectAllChildren(node)
  }
  const dispatchSelectionChange = () => {
    document.dispatchEvent(new Event('selectionchange'))
  }
  const removeSelection = () => {
    window.getSelection()?.removeAllRanges()
  }

  it('returns the singleton Selection object no matter how the selection changes', async () => {
    const windowSelection = window.getSelection()
    expect(windowSelection).not.toBeNull()

    const { result, act } = await renderHook(() => useTextSelection())
    expect(result.current.selection).toBe(windowSelection)

    await act(() => {
      selectHelloWorldNode()
      dispatchSelectionChange()
    })
    expect(result.current.selection).toBe(windowSelection)

    await act(() => {
      removeSelection()
      dispatchSelectionChange()
    })
    expect(result.current.selection).toBe(windowSelection)
  })

  it('initializes with window.getSelection(), which is always present in browsers', async () => {
    const { result } = await renderHook(() => useTextSelection())

    expect(result.current.text).toBe('')
    expect(result.current.rects).toEqual([])
    expect(result.current.ranges).toEqual([])
    expect(result.current.selection?.anchorNode).toBe(null)
    expect(result.current.selection?.focusNode).toBe(null)
  })

  it('initializes with an existing selection', async () => {
    selectHelloWorldNode()

    const { result } = await renderHook(() => useTextSelection())

    expect(result.current.text).toBe('Hello World')
    expect(result.current.ranges).toHaveLength(1)
    expect(result.current.rects).toHaveLength(1)
    expect(result.current.selection?.anchorNode).toBe(node)
    expect(result.current.selection?.focusNode).toBe(node)
  })

  it('updates on selectionchange and clears when the selection is removed', async () => {
    const { result, act } = await renderHook(() => useTextSelection())

    await act(() => {
      selectHelloWorldNode()
      dispatchSelectionChange()
    })
    await expect.poll(() => result.current.text).toBe('Hello World')
    expect(result.current.ranges).toHaveLength(1)
    expect(result.current.rects).toHaveLength(1)
    expect(result.current.selection?.anchorNode).toBe(node)
    expect(result.current.selection?.focusNode).toBe(node)

    await act(() => {
      removeSelection()
      dispatchSelectionChange()
    })
    await expect.poll(() => result.current.text).toBe('')
    expect(result.current.ranges).toHaveLength(0)
    expect(result.current.rects).toHaveLength(0)
    expect(result.current.selection?.anchorNode).toBe(null)
    expect(result.current.selection?.focusNode).toBe(null)
  })

  it('resets the text when the selection collapses', async () => {
    const { result, act } = await renderHook(() => useTextSelection())

    const range = document.createRange()
    range.selectNodeContents(node)
    await act(() => {
      window.getSelection()?.addRange(range)
      dispatchSelectionChange()
    })
    await expect.poll(() => result.current.text).toBe('Hello World')

    await act(() => {
      range.collapse()
      dispatchSelectionChange()
    })
    await expect.poll(() => result.current.text).toBe('')
    expect(result.current.selection?.isCollapsed).toBe(true)
  })

  it('keeps its snapshot stable and stops listening after unmount', async () => {
    const { result, act, unmount } = await renderHook(() => useTextSelection())

    await act(() => {
      selectHelloWorldNode()
      dispatchSelectionChange()
    })
    await expect.poll(() => result.current.text).toBe('Hello World')

    const snapshot = result.current
    unmount()

    expect(() => {
      removeSelection()
      dispatchSelectionChange()
    }).not.toThrow()

    expect(result.current).toBe(snapshot)
  })

  it('supports a custom window option', async () => {
    let fakeText = 'Fake text'
    const fakeSelection = {
      toString: () => fakeText,
      rangeCount: 0,
    } as unknown as Selection
    const added: Array<[string, EventListener]> = []
    const removed: Array<[string, EventListener]> = []
    const fakeDocument = {
      addEventListener: (type: string, listener: EventListener) => {
        added.push([type, listener])
      },
      removeEventListener: (type: string, listener: EventListener) => {
        removed.push([type, listener])
      },
    } as unknown as Document
    const fakeWindow = {
      document: fakeDocument,
      getSelection: () => fakeSelection,
    } as unknown as Window

    const { result, act, unmount } = await renderHook(() => useTextSelection({ window: fakeWindow }))

    // the initial selection read happens in the mount effect
    expect(result.current.text).toBe('Fake text')
    expect(result.current.selection).toBe(fakeSelection)
    expect(added).toHaveLength(1)
    expect(added[0][0]).toBe('selectionchange')

    await act(() => {
      fakeText = 'Changed text'
      added.forEach(([, listener]) => listener(new Event('selectionchange')))
    })
    expect(result.current.text).toBe('Changed text')

    unmount()
    expect(removed).toHaveLength(1)
    expect(removed[0][1]).toBe(added[0][1])
  })
})
