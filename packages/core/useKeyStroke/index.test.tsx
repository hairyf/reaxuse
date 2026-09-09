import type { Mock } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { useKeyStroke } from '../useKeyStroke'

describe('useKeyStroke', () => {
  let callBackFn: Mock<(event: KeyboardEvent) => void>

  beforeEach(() => {
    callBackFn = vi.fn<(event: KeyboardEvent) => void>()
  })

  it('listen to single key', async () => {
    await renderHook(() => useKeyStroke('a', callBackFn))
    await userEvent.keyboard('ab')
    expect(callBackFn).toBeCalledTimes(1)
  })

  it('listen to multi keys', async () => {
    await renderHook(() => useKeyStroke(['a', 'b', 'c'], callBackFn))
    await userEvent.keyboard('abcd')
    expect(callBackFn).toBeCalledTimes(3)
  })

  it('use function filter', async () => {
    const filter = (event: KeyboardEvent) => {
      return event.key === 'a'
    }
    await renderHook(() => useKeyStroke(filter, callBackFn))
    await userEvent.keyboard('abc')
    expect(callBackFn).toBeCalledTimes(1)
  })

  it('listen to all keys by boolean', async () => {
    await renderHook(() => useKeyStroke(true, callBackFn))
    await userEvent.keyboard('abcde')
    expect(callBackFn).toBeCalledTimes(5)
  })

  it('listen to all keys by constructor', async () => {
    await renderHook(() => useKeyStroke(callBackFn))
    await userEvent.keyboard('abcde')
    expect(callBackFn).toBeCalledTimes(5)
  })

  it('listen to keypress', async () => {
    await renderHook(() => useKeyStroke('a', callBackFn, { eventName: 'keypress' }))
    await userEvent.keyboard('a>5')
    await userEvent.keyboard('b')
    expect(callBackFn).toBeCalledTimes(1)
  })

  it('ignore repeated events', async () => {
    await renderHook(() => useKeyStroke('a', callBackFn, { dedupe: true }))
    await userEvent.keyboard('{a>5/}')
    expect(callBackFn).toBeCalledTimes(1)
  })

  it('returns a stop function that removes the listener', async () => {
    let stop: (() => void) | undefined
    await renderHook(() => {
      stop = useKeyStroke('a', callBackFn)
    })
    await userEvent.keyboard('a')
    expect(callBackFn).toBeCalledTimes(1)

    stop?.()
    await userEvent.keyboard('a')
    expect(callBackFn).toBeCalledTimes(1)
  })

  it('removes the listener on unmount', async () => {
    const { unmount } = await renderHook(() => useKeyStroke('a', callBackFn))
    unmount()
    await userEvent.keyboard('a')
    expect(callBackFn).toBeCalledTimes(0)
  })
})
