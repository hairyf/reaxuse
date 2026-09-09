import type { ElementTarget } from '../useResizeObserver'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useElementSize } from '../useElementSize'

/**
 * Let two rendering frames pass plus a slack timeout — the platform
 * `ResizeObserver` delivers asynchronously per frame, so a deterministic
 * "nothing was delivered" assertion has to wait out a couple of frames.
 */
async function settleFrames(): Promise<void> {
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  await new Promise<void>(resolve => setTimeout(resolve, 50))
}

// The element uses `box-sizing: border-box` with a 200x100 outer size,
// 10px padding and 5px border on each side, so:
//   - border-box measurement => 200 x 100
//   - content-box measurement => 200 - 20 - 10 = 170 wide, 100 - 20 - 10 = 70 tall
describe('useElementSize', () => {
  let el: HTMLDivElement

  beforeEach(() => {
    el = document.createElement('div')
    el.style.cssText = 'width: 200px; height: 100px; padding: 10px; border: 5px solid black; box-sizing: border-box;'
    document.body.appendChild(el)
  })

  afterEach(() => {
    el.remove()
  })

  it('should prefill with border-box dimensions when box is border-box', async () => {
    const { result } = await renderHook(() => useElementSize(el, { width: 0, height: 0 }, { box: 'border-box' }))

    expect(result.current.width).toBe(200)
    expect(result.current.height).toBe(100)
  })

  it('should prefill with content-box dimensions when box is content-box', async () => {
    const { result } = await renderHook(() => useElementSize(el, { width: 0, height: 0 }, { box: 'content-box' }))

    expect(result.current.width).toBe(170)
    expect(result.current.height).toBe(70)
  })

  it('should prefill with content-box dimensions by default', async () => {
    const { result } = await renderHook(() => useElementSize(el))

    expect(result.current.width).toBe(170)
    expect(result.current.height).toBe(70)
  })

  it('updates width/height when the element is resized', async () => {
    const { result, unmount } = await renderHook(() =>
      useElementSize(el, { width: 0, height: 0 }, { box: 'border-box' }),
    )

    el.style.width = '300px'
    await expect.poll(() => result.current.width).toBe(300)
    expect(result.current.height).toBe(100)

    await unmount()
  })

  it('stop() disconnects the observer', async () => {
    const { result, unmount } = await renderHook(() =>
      useElementSize(el, { width: 0, height: 0 }, { box: 'border-box' }),
    )

    await expect.poll(() => result.current.width).toBe(200)

    result.current.stop()
    el.style.width = '320px'
    await settleFrames()
    expect(result.current.width).toBe(200)

    await unmount()
  })

  it('reports the size when a ref target attaches between renders', async () => {
    const ref = { current: null as HTMLDivElement | null }

    const { result, rerender, unmount } = await renderHook(
      (props?: { target: ElementTarget }) =>
        useElementSize(props?.target ?? ref),
      { initialProps: { target: ref } },
    )

    await settleFrames()
    expect(result.current.width).toBe(0)

    ref.current = el
    await rerender({ target: ref })
    await expect.poll(() => result.current.width).toBe(170)

    await unmount()
  })
})
