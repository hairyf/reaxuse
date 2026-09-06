import type { RefObject } from 'react'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useMutationObserver } from './useMutationObserver'

/**
 * MutationObserver delivers records asynchronously on a microtask; waiting on
 * a macrotask guarantees the queue was drained first.
 */
async function flush(): Promise<void> {
  await new Promise<void>(resolve => setTimeout(resolve, 0))
}

describe('useMutationObserver', () => {
  it('should be defined', () => {
    expect(useMutationObserver).toBeDefined()
  })

  it('accepts an array template ref bound to v-for as target', () => {
    expectTypeOf<Readonly<RefObject<HTMLElement[] | null>>>()
      .toExtend<Parameters<typeof useMutationObserver>[0]>()
  })

  it('should work with attributes', async () => {
    const cb = vi.fn()

    const target = document.createElement('div')
    target.setAttribute('id', 'header')

    const { unmount } = await renderHook(() => useMutationObserver(target, cb, {
      attributes: true,
    }))

    target.setAttribute('id', 'footer')
    await flush()
    expect(cb).toHaveBeenCalledTimes(1)

    target.setAttribute('id', 'header')
    await flush()
    expect(cb).toHaveBeenCalledTimes(2)
    const record = cb.mock.calls[0][0][0]
    expect(record).toBeInstanceOf(MutationRecord)
    expect(record.target).toBe(target)

    await unmount()
  })

  it('should work with childList', async () => {
    const target = document.createElement('div')

    const cb = vi.fn()

    const { unmount } = await renderHook(() => useMutationObserver(target, cb, {
      childList: true,
    }))

    target.appendChild(document.createElement('div'))
    await flush()
    expect(cb).toHaveBeenCalled()

    await unmount()
  })

  it('should work with subtree', async () => {
    const target = document.createElement('div')
    const cb = vi.fn()

    const { unmount } = await renderHook(() => useMutationObserver(target, cb, {
      subtree: true,
      childList: true,
    }))

    const child = document.createElement('div')

    target.appendChild(child)
    await flush()
    expect(cb).toHaveBeenCalled()

    child.appendChild(document.createElement('div'))
    await flush()
    expect(cb).toHaveBeenCalledTimes(2)

    await unmount()
  })

  it('should work with characterData', async () => {
    const target = document.createTextNode('123')
    const cb = vi.fn()
    const { unmount } = await renderHook(() =>
      // @ts-expect-error — upstream accepts Text nodes even though the type says MaybeElement
      useMutationObserver(target, cb, {
        characterData: true,
      }),
    )
    target.data = 'content'

    await flush()
    expect(cb).toHaveBeenCalled()

    target.data = 'footer'
    await flush()
    expect(cb).toHaveBeenCalledTimes(2)

    await unmount()
  })

  it('should work with attributeFilter', async () => {
    const target = document.createElement('div')
    const cb = vi.fn()

    const { unmount } = await renderHook(() => useMutationObserver(target, cb, {
      attributes: true,
      attributeFilter: ['id'],
    }))

    target.setAttribute('id', 'footer')
    await flush()
    expect(cb).toHaveBeenCalled()

    target.setAttribute('class', 'footer')
    await flush()
    expect(cb).toHaveBeenCalledTimes(1)

    await unmount()
  })

  it('should work with attributeOldValue', async () => {
    const target = document.createElement('div')
    const cb = vi.fn()

    const { unmount } = await renderHook(() => useMutationObserver(target, cb, {
      attributes: true,
      attributeOldValue: true,
    }))

    target.setAttribute('id', 'footer')
    await flush()
    expect(cb).toHaveBeenCalled()

    const record = cb.mock.calls[0][0][0]
    expect(record.oldValue).toBe(null)

    target.setAttribute('id', 'header')
    await flush()
    expect(cb).toHaveBeenCalledTimes(2)

    const record2 = cb.mock.calls[1][0][0]
    expect(record2.oldValue).toBe('footer')

    await unmount()
  })

  it('should work with characterDataOldValue', async () => {
    const target = document.createTextNode('123')
    const cb = vi.fn()
    const { unmount } = await renderHook(() =>
      // @ts-expect-error — upstream accepts Text nodes even though the type says MaybeElement
      useMutationObserver(target, cb, {
        characterData: true,
        characterDataOldValue: true,
      }),
    )

    target.data = 'content'
    await flush()
    expect(cb).toHaveBeenCalled()

    const record = cb.mock.calls[0][0][0]
    expect(record.oldValue).toBe('123')

    target.data = 'footer'
    await flush()
    expect(cb).toHaveBeenCalledTimes(2)

    const record2 = cb.mock.calls[1][0][0]
    expect(record2.oldValue).toBe('content')

    await unmount()
  })

  it('should work with stop', async () => {
    const target = document.createElement('div')
    const cb = vi.fn()

    const { result, unmount } = await renderHook(() => useMutationObserver(target, cb, {
      attributes: true,
    }))

    target.setAttribute('id', 'footer')
    await flush()
    expect(cb).toHaveBeenCalled()

    result.current.stop()
    target.setAttribute('id', 'header')
    await flush()
    expect(cb).toHaveBeenCalledTimes(1)

    await unmount()
  })

  it('should work with takeRecords', async () => {
    const target = document.createElement('div')
    const cb = vi.fn()

    const { result, unmount } = await renderHook(() => useMutationObserver(target, cb, {
      attributes: true,
    }))

    target.setAttribute('id', 'footer')
    await flush()
    expect(cb).toHaveBeenCalledTimes(1)

    target.setAttribute('id', 'header')
    const records = result.current.takeRecords()

    await flush()
    expect(records).toHaveLength(1)
    expect(records![0].target).toBe(target)
    expect(cb).toHaveBeenCalledTimes(1)

    await unmount()
  })

  it('should work with multiple targets', async () => {
    const headerElement: { current: HTMLDivElement | null } = { current: document.createElement('div') }
    const footerElement: { current: HTMLDivElement | null } = { current: document.createElement('div') }
    const targetRefs = [headerElement, footerElement]
    const cb = vi.fn()

    const { rerender, result, unmount } = await renderHook(
      (props?: { target: Parameters<typeof useMutationObserver>[0] }) =>
        useMutationObserver(props?.target ?? [], cb, {
          attributes: true,
        }),
      { initialProps: { target: targetRefs } },
    )

    headerElement.current?.setAttribute('id', 'header')
    footerElement.current?.setAttribute('id', 'footer')
    let records = result.current.takeRecords()
    await flush()
    expect(records).toHaveLength(2)
    expect(records![0].target).toBe(headerElement.current)
    expect(records![1].target).toBe(footerElement.current)

    headerElement.current = null
    footerElement.current?.removeAttribute('id')
    records = result.current.takeRecords()
    await rerender({ target: targetRefs })
    await flush()
    expect(records).toHaveLength(1)
    expect(records![0].target).toBe(footerElement.current)

    await unmount()
  })
})
