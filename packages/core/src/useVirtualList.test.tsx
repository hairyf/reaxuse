import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useVirtualList } from './useVirtualList'

function createDiv(properties: Partial<HTMLElement>) {
  return {
    ...document.createElement('div'),
    ...properties,
    scrollTo(options?: ScrollToOptions | number) {
      if (typeof options === 'object') {
        if (options.top) {
          this.scrollTop = options.top
        }
        if (options.left) {
          this.scrollLeft = options.left
        }
      }
    },
  }
}

describe('useVirtualList', () => {
  it('should be defined', () => {
    expect(useVirtualList).toBeDefined()
  })

  it('should accept plain arrays as input', async () => {
    const { result, act } = await renderHook(() =>
      useVirtualList(['a', 'b', 'c', 'd', 'e', 'f'], { itemHeight: () => 50 }),
    )
    const div = createDiv({ clientHeight: 100 })

    await act(() => result.current.containerProps.ref(div))
    await act(() => result.current.scrollTo(0))
    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
  })
})

describe('useVirtualList, vertical', () => {
  it('returns all original items if they fit the container', async () => {
    const { result, act } = await renderHook(() =>
      useVirtualList({ current: ['a', 'b', 'c', 'd', 'e', 'f'] }, { itemHeight: () => 50, overscan: 1 }),
    )
    const div = createDiv({ clientHeight: 50 })

    await act(() => result.current.containerProps.ref(div))

    await act(() => result.current.containerProps.ref({ ...div, clientHeight: 200 }))
    await act(() => result.current.scrollTo(0))
    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])

    await act(() => result.current.containerProps.ref({ ...div, clientHeight: 250 }))
    await act(() => result.current.scrollTo(0))
    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
  })

  it('returns the current visible window of items if there are too many for the container', async () => {
    const { result, act } = await renderHook(() =>
      useVirtualList({ current: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }, { itemHeight: () => 50, overscan: 1 }),
    )
    const div = createDiv({ clientHeight: 50 })

    await act(() => result.current.containerProps.ref(div))

    await act(() => result.current.scrollTo(0))
    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c'])

    await act(() => result.current.scrollTo(1))
    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c'])

    await act(() => result.current.scrollTo(2))
    expect(result.current.list.map(i => i.data)).toEqual(['b', 'c', 'd'])

    await act(() => result.current.scrollTo(3))
    expect(result.current.list.map(i => i.data)).toEqual(['c', 'd', 'e'])

    await act(() => result.current.scrollTo(4))
    expect(result.current.list.map(i => i.data)).toEqual(['d', 'e', 'f'])

    await act(() => result.current.scrollTo(5))
    expect(result.current.list.map(i => i.data)).toEqual(['e', 'f', 'g'])

    await act(() => result.current.scrollTo(6))
    expect(result.current.list.map(i => i.data)).toEqual(['f', 'g'])
  })

  it('correctly uses the scrollTo block option to align inside the container', async () => {
    const { result, act } = await renderHook(() =>
      useVirtualList({ current: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }, { itemHeight: () => 50, overscan: 1 }),
    )
    const div = createDiv({ clientHeight: 140 })

    await act(() => result.current.containerProps.ref(div))

    await act(() => result.current.scrollTo(0, { block: 'start' }))
    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c', 'd'])

    await act(() => result.current.scrollTo(3, { block: 'start' }))
    expect(result.current.list.map(i => i.data)).toEqual(['c', 'd', 'e', 'f'])

    await act(() => result.current.scrollTo(3, { block: 'center' }))
    expect(result.current.list.map(i => i.data)).toEqual(['c', 'd', 'e', 'f'])

    await act(() => result.current.scrollTo(3, { block: 'end' }))
    expect(result.current.list.map(i => i.data)).toEqual(['b', 'c', 'd', 'e'])

    div.scrollTop = 1500
    await act(() => result.current.scrollTo(3, { block: 'nearest' }))
    expect(result.current.list.map(i => i.data)).toEqual(['c', 'd', 'e', 'f'])

    div.scrollTop = 0
    await act(() => result.current.scrollTo(3, { block: 'nearest' }))
    expect(result.current.list.map(i => i.data)).toEqual(['b', 'c', 'd', 'e'])
  })

  it('recomputes the visible range when a reactive item height changes without scrolling', async () => {
    const { result, act, rerender } = await renderHook(
      (props?: { itemHeight?: number }) => useVirtualList(
        { current: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] },
        { itemHeight: () => props?.itemHeight ?? 50, overscan: 1 },
      ),
      { initialProps: {} },
    )
    const div = createDiv({ clientHeight: 100 })

    await act(() => result.current.containerProps.ref(div))
    await act(() => result.current.scrollTo(0))
    // Let the container-ref state mirror settle so the item-height change
    // below is the only thing that can trigger a recalculation.
    await act(async () => {})
    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c', 'd'])

    // Shrinking the items makes more of them fit; the range must update even
    // though neither the source nor the container size changed and no scroll
    // event occurred.
    await rerender({ itemHeight: 25 })
    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
  })
})

describe('useVirtualList, horizontal', () => {
  it('returns all original items if they fit the container', async () => {
    const { result, act } = await renderHook(() =>
      useVirtualList({ current: ['a', 'b', 'c', 'd', 'e', 'f'] }, { itemWidth: () => 50, overscan: 1 }),
    )
    const div = createDiv({ clientWidth: 50 })

    await act(() => result.current.containerProps.ref(div))

    await act(() => result.current.containerProps.ref({ ...div, clientWidth: 200 }))
    await act(() => result.current.scrollTo(0))
    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])

    await act(() => result.current.containerProps.ref({ ...div, clientWidth: 250 }))
    await act(() => result.current.scrollTo(0))
    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
  })

  it('returns the current visible window of items if there are too many for the container', async () => {
    const { result, act } = await renderHook(() =>
      useVirtualList({ current: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }, { itemWidth: () => 50, overscan: 1 }),
    )
    const div = createDiv({ clientWidth: 50 })

    await act(() => result.current.containerProps.ref(div))

    await act(() => result.current.scrollTo(0))
    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c'])

    await act(() => result.current.scrollTo(1))
    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c'])

    await act(() => result.current.scrollTo(2))
    expect(result.current.list.map(i => i.data)).toEqual(['b', 'c', 'd'])

    await act(() => result.current.scrollTo(3))
    expect(result.current.list.map(i => i.data)).toEqual(['c', 'd', 'e'])

    await act(() => result.current.scrollTo(4))
    expect(result.current.list.map(i => i.data)).toEqual(['d', 'e', 'f'])

    await act(() => result.current.scrollTo(5))
    expect(result.current.list.map(i => i.data)).toEqual(['e', 'f', 'g'])

    await act(() => result.current.scrollTo(6))
    expect(result.current.list.map(i => i.data)).toEqual(['f', 'g'])
  })

  it('correctly uses the scrollTo inline option to align inside the container', async () => {
    const { result, act } = await renderHook(() =>
      useVirtualList({ current: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }, { itemWidth: () => 50, overscan: 1 }),
    )
    const div = createDiv({ clientWidth: 140 })

    await act(() => result.current.containerProps.ref(div))

    await act(() => result.current.scrollTo(0, { inline: 'start' }))
    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c', 'd'])

    await act(() => result.current.scrollTo(3, { inline: 'start' }))
    expect(result.current.list.map(i => i.data)).toEqual(['c', 'd', 'e', 'f'])

    await act(() => result.current.scrollTo(3, { inline: 'center' }))
    expect(result.current.list.map(i => i.data)).toEqual(['c', 'd', 'e', 'f'])

    await act(() => result.current.scrollTo(3, { inline: 'end' }))
    expect(result.current.list.map(i => i.data)).toEqual(['b', 'c', 'd', 'e'])

    div.scrollLeft = 1500
    await act(() => result.current.scrollTo(3, { inline: 'nearest' }))
    expect(result.current.list.map(i => i.data)).toEqual(['c', 'd', 'e', 'f'])

    div.scrollLeft = 0
    await act(() => result.current.scrollTo(3, { inline: 'nearest' }))
    expect(result.current.list.map(i => i.data)).toEqual(['b', 'c', 'd', 'e'])
  })

  it('allows both readonly and mutable arrays as input', async () => {
    const mutableInput: string[] = ['a', 'b', 'c', 'd', 'e', 'f']
    const readonlyInput: readonly string[] = ['a', 'b', 'c', 'd', 'e', 'f']

    const readonlyHook = await renderHook(() =>
      useVirtualList({ current: readonlyInput }, { itemHeight: () => 50, overscan: 1 }),
    )
    const mutableHook = await renderHook(() =>
      useVirtualList({ current: mutableInput }, { itemHeight: () => 50, overscan: 1 }),
    )

    expect(readonlyHook.result.current.list).toBeDefined()
    expect(mutableHook.result.current.list).toBeDefined()
  })

  it('reacts to changes in a source ref when mutated if no size changes are made to the container', async () => {
    const mutableInput: { current: string[] } = { current: ['a', 'b'] }

    const { result, act, rerender } = await renderHook(
      () => useVirtualList(mutableInput, { itemHeight: () => 10 }),
    )

    const div = createDiv({ clientHeight: 100 })
    await act(() => result.current.containerProps.ref(div))
    await act(() => result.current.scrollTo(0))

    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b'])

    mutableInput.current.push('c', 'd')
    await rerender()

    expect(result.current.list.map(i => i.data)).toEqual(['a', 'b', 'c', 'd'])
  })
})
