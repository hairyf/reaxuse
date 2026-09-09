import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useElementOverflow } from '../useElementOverflow'

describe('useElementOverflow', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should be defined', () => {
    expect(useElementOverflow).toBeDefined()
  })

  it('should work when el is not an element', async () => {
    const { result } = await renderHook(() => useElementOverflow(null))
    expect(result.current.isXOverflowed).toBe(false)
    expect(result.current.isYOverflowed).toBe(false)
  })

  it('should expose the overflow state as plain boolean state', async () => {
    // upstream returns `shallowReadonly` refs — React exposes plain booleans
    const { result } = await renderHook(() => useElementOverflow(null))
    expect(result.current.isXOverflowed).toBeTypeOf('boolean')
    expect(result.current.isYOverflowed).toBeTypeOf('boolean')
  })

  it('should update overflow state when the container\'s size changes', async () => {
    // set container's size
    const el = document.createElement('div')
    document.body.appendChild(el)
    changeDomWidth(el, 'width', 100)
    changeDomWidth(el, 'offsetWidth', 100)
    changeDomWidth(el, 'scrollWidth', 100)
    // set content's size
    const content = document.createElement('div')
    changeDomWidth(content, 'width', 50)
    el.appendChild(content)

    const { result, act } = await renderHook(() => useElementOverflow(el))

    expect(result.current.isXOverflowed).toBe(false)

    // update container's size
    changeDomWidth(el, 'width', 10)
    changeDomWidth(el, 'offsetWidth', 10)
    changeDomWidth(el, 'scrollWidth', 50)
    await act(() => result.current.update())
    expect(result.current.isXOverflowed).toBe(true)
    el.remove()
  })

  it('should update overflow state when content changed', async () => {
    // set container's size
    const el = document.createElement('div')
    document.body.appendChild(el)
    changeDomWidth(el, 'width', 100)
    changeDomWidth(el, 'offsetWidth', 100)
    changeDomWidth(el, 'scrollWidth', 100)
    const content = document.createElement('div')
    el.appendChild(content)

    const { result, act } = await renderHook(() =>
      useElementOverflow(el, { observeMutation: true }),
    )

    // update content's size
    changeDomWidth(content, 'width', 200)
    changeDomWidth(el, 'scrollWidth', 200)
    await act(() => result.current.update())
    expect(result.current.isXOverflowed).toBe(true)
    el.remove()
  })

  it('should update the vertical overflow state', async () => {
    const el = document.createElement('div')
    changeDomSize(el, 'offsetHeight', 10)
    changeDomSize(el, 'scrollHeight', 50)

    const { result, act } = await renderHook(() => useElementOverflow(el))

    await act(() => result.current.update())
    expect(result.current.isYOverflowed).toBe(true)
  })

  it('should not update when window is not available', async () => {
    const el = document.createElement('div')
    changeDomSize(el, 'offsetWidth', 10)
    changeDomSize(el, 'scrollWidth', 50)

    const { result, act } = await renderHook(() =>
      useElementOverflow(el, { window: null as unknown as Window }),
    )

    await act(() => result.current.update())
    expect(result.current.isXOverflowed).toBe(false)
  })

  it('should ignore svg elements', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    const { result, act } = await renderHook(() => useElementOverflow(svg))

    await act(() => result.current.update())
    expect(result.current.isXOverflowed).toBe(false)
    expect(result.current.isYOverflowed).toBe(false)
  })

  it('should update and call onUpdated from the resize observer', async () => {
    let resizeCallback: ResizeObserverCallback | undefined
    const onUpdated = vi.fn()
    const disconnect = vi.fn()
    const observe = vi.fn()

    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback
      }

      observe = observe
      unobserve = () => {}
      disconnect = disconnect
    })

    const el = document.createElement('div')
    document.body.appendChild(el)
    changeDomSize(el, 'offsetWidth', 10)
    changeDomSize(el, 'scrollWidth', 50)

    const { result, act, unmount } = await renderHook(() =>
      useElementOverflow(el, { onUpdated }),
    )

    await act(() => {
      resizeCallback?.([], {} as unknown as ResizeObserver)
    })

    expect(result.current.isXOverflowed).toBe(true)
    expect(onUpdated).toHaveBeenCalledOnce()

    await unmount()
    expect(disconnect).toHaveBeenCalled()
    el.remove()
  })

  it('should update and call onUpdated from the mutation observer', async () => {
    const onUpdated = vi.fn()
    const el = document.createElement('div')
    document.body.appendChild(el)
    const content = document.createTextNode('fit')
    el.appendChild(content)
    changeDomSize(el, 'offsetWidth', 10)
    changeDomSize(el, 'scrollWidth', 50)

    const { result } = await renderHook(() =>
      useElementOverflow(el, { observeMutation: true, onUpdated }),
    )

    content.data = 'overflowed'

    await vi.waitFor(() => {
      expect(result.current.isXOverflowed).toBe(true)
    })

    expect(onUpdated).toHaveBeenCalled()
    el.remove()
  })

  it('should pass MutationObserverInit through when observeMutation is an object', async () => {
    const observed: MutationObserverInit[] = []

    vi.stubGlobal('MutationObserver', class {
      constructor(_callback: MutationCallback) {}

      observe(_target: Node, options?: MutationObserverInit): void {
        observed.push(options ?? {})
      }

      disconnect(): void {}

      takeRecords(): MutationRecord[] {
        return []
      }
    })

    const el = document.createElement('div')

    const { result } = await renderHook(() =>
      useElementOverflow(el, { observeMutation: { childList: true, subtree: true } }),
    )

    expect(result.current.isXOverflowed).toBe(false)
    expect(observed).toEqual([{ childList: true, subtree: true }])
    el.remove()
  })

  it('stop() stops observing and updating', async () => {
    const el = document.createElement('div')
    changeDomSize(el, 'offsetWidth', 10)
    changeDomSize(el, 'scrollWidth', 50)

    const { result, act } = await renderHook(() => useElementOverflow(el))

    result.current.stop()
    await act(() => result.current.update())
    expect(result.current.isXOverflowed).toBe(false)
  })

  it('should start observing when a ref target attaches after mount', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    changeDomSize(el, 'offsetWidth', 10)
    changeDomSize(el, 'scrollWidth', 50)
    const ref = { current: null as HTMLDivElement | null }

    const { result, rerender } = await renderHook(
      (props?: { target: { current: HTMLDivElement | null } }) =>
        useElementOverflow(props?.target ?? ref),
      { initialProps: { target: ref } },
    )

    expect(result.current.isXOverflowed).toBe(false)

    ref.current = el
    await rerender({ target: ref })
    // the resize observer delivers asynchronously — overflow is measured then
    await expect.poll(() => result.current.isXOverflowed).toBe(true)

    el.remove()
  })
})

function changeDomWidth(el: HTMLDivElement, property: 'width' | 'offsetWidth' | 'scrollWidth', value: number) {
  if (property === 'width') {
    el.style.width = `${value}px`
    return
  }
  Object.defineProperty(el, property, {
    value,
    writable: true,
  })
}

function changeDomSize(el: Element, property: 'offsetWidth' | 'scrollWidth' | 'offsetHeight' | 'scrollHeight', value: number) {
  Object.defineProperty(el, property, {
    value,
    writable: true,
  })
}
