import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useStateDebounced } from './useStateDebounced'

describe('useStateDebounced', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', async () => {
    const { result } = await renderHook(() => useStateDebounced('foo', 1000))

    expect(result.current[0]).toBe('foo')
    expect(result.current[2]).toBe('foo')
  })

  it('flips the debounced value only once the delay elapses after setValue', async () => {
    const { result, act } = await renderHook(() => useStateDebounced('foo', 1000))

    await act(() => result.current[1]('bar'))

    // the source flips immediately, the debounced value still holds 'foo'
    expect(result.current[0]).toBe('bar')
    expect(result.current[2]).toBe('foo')

    await act(async () => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current[2]).toBe('foo')

    await act(async () => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current[2]).toBe('bar')
  })

  it('supports functional setValue updates', async () => {
    const { result, act } = await renderHook(() => useStateDebounced(0, 100))

    await act(() => result.current[1](current => current + 1))
    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current[0]).toBe(1)
    expect(result.current[2]).toBe(1)
  })

  it('collapses a burst of writes into a single trailing update with the latest value', async () => {
    const { result, act } = await renderHook(() => useStateDebounced('', 100))

    await act(() => result.current[1]('a'))
    await act(() => result.current[1]('b'))
    await act(() => result.current[1]('c'))
    expect(result.current[2]).toBe('')

    // writes keep re-scheduling the pending update, only 'c' is committed
    await act(async () => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current[2]).toBe('')

    await act(async () => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current[2]).toBe('c')
  })

  it('forces the update when maxWait elapses', async () => {
    const { result, act } = await renderHook(() => useStateDebounced('', 500, { maxWait: 1000 }))

    await act(() => result.current[1]('a'))
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    await act(() => result.current[1]('b'))
    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    await act(() => result.current[1]('c'))

    // the regular timer was pushed to 1100ms, but the maxWait timer fires at 1000ms
    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    expect(result.current[2]).toBe('c')
  })

  it('re-reads a getter ms on every write', async () => {
    let delay = 100
    const { result, act } = await renderHook(() => useStateDebounced('', () => delay))

    await act(() => result.current[1]('a'))
    await act(async () => {
      delay = 300
      result.current[1]('b')
    })

    // 'a' was superseded with the old delay — its timer was cleared
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current[2]).toBe('')

    await act(async () => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current[2]).toBe('b')
  })

  it('re-reads a ref-like ms ({ current }) on every write', async () => {
    const delay = { current: 100 }
    const { result, act } = await renderHook(() => useStateDebounced('', delay))

    await act(() => result.current[1]('a'))
    await act(async () => {
      delay.current = 300
      result.current[1]('b')
    })

    await act(async () => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current[2]).toBe('')

    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current[2]).toBe('b')
  })
})

describe('useStateDebounced (component)', () => {
  function UseStateDebouncedDemo() {
    const [input, setInput, debounced] = useStateDebounced('', 500)

    return (
      <div>
        <button onClick={() => setInput(current => `${current}a`)}>Type a</button>
        <p>
          Input:
          {' '}
          {input}
        </p>
        <p>
          Debounced:
          {' '}
          {debounced}
        </p>
      </div>
    )
  }

  it('debounces a burst of edits into a single display update', async () => {
    const screen = await render(<UseStateDebouncedDemo />)
    const type = screen.getByRole('button', { name: 'Type a' })

    await type.click()
    await type.click()
    await type.click()

    await expect.element(screen.getByText('Input: aaa')).toBeVisible()
    // the debounced display catches up after the last write settles
    await expect.element(screen.getByText('Debounced: aaa')).toBeVisible()
  })
})
