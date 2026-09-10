import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useStateThrottled } from '../useStateThrottled'

describe('useStateThrottled', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be defined', () => {
    expect(useStateThrottled).toBeDefined()
  })

  it('seeds both value and throttled with the initial value', async () => {
    const { result } = await renderHook(() => useStateThrottled('foo', 1000))

    const [value, setValue, throttled] = result.current
    expect(value).toBe('foo')
    expect(typeof setValue).toBe('function')
    expect(throttled).toBe('foo')
  })

  it('commits on the leading edge and trails after the delay', async () => {
    const { result, act } = await renderHook(() => useStateThrottled('', 1000))

    // the first change lands on the leading edge of a fresh window
    await act(async () => {
      result.current[1]('first')
    })
    expect(result.current[0]).toBe('first')
    expect(result.current[2]).toBe('first')

    // a change inside the window stays pending until the trailing edge
    await act(async () => {
      result.current[1]('second')
    })
    expect(result.current[0]).toBe('second')
    expect(result.current[2]).toBe('first')

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current[0]).toBe('second')
    expect(result.current[2]).toBe('second')
  })

  it('collapses in-window changes into one trailing commit with the latest value', async () => {
    const { result, act } = await renderHook(() => useStateThrottled(0, 500))

    await act(async () => {
      result.current[1](1)
    })
    expect(result.current[2]).toBe(1)

    await act(async () => {
      result.current[1](2)
    })
    await act(async () => {
      result.current[1](3)
    })
    expect(result.current[2]).toBe(1)

    await act(async () => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current[2]).toBe(3)
  })

  it('drops in-window changes with trailing: false', async () => {
    const { result, act } = await renderHook(() => useStateThrottled('', 1000, false))

    // the leading edge still commits the first change
    await act(async () => {
      result.current[1]('a')
    })
    expect(result.current[2]).toBe('a')

    // changes inside the window are dropped, even after the window passes
    await act(async () => {
      result.current[1]('b')
    })
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current[2]).toBe('a')

    // a change after a quiet window commits again on the leading edge
    await act(async () => {
      result.current[1]('c')
    })
    expect(result.current[2]).toBe('c')
  })

  it('suppresses the leading edge with leading: false', async () => {
    const { result, act } = await renderHook(() => useStateThrottled('', 1000, true, false))

    // the first change inside a window is dropped
    await act(async () => {
      result.current[1]('a')
    })
    expect(result.current[2]).toBe('')

    // later changes collapse and are committed on the trailing edge
    await act(async () => {
      result.current[1]('b')
    })
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current[2]).toBe('b')
  })

  it('supports a controlled State tuple and routes updates to its setter', async () => {
    let external = 'initial'
    const setExternal = vi.fn((next: string | ((prev: string) => string)) => {
      external = typeof next === 'function' ? next(external) : next
    })
    const { result, rerender, act } = await renderHook(() => useStateThrottled([external, setExternal], 1000))

    await act(async () => result.current[1]('next'))
    expect(setExternal).toHaveBeenCalledWith('next')
    external = 'next'
    await rerender()
    expect(result.current[0]).toBe('next')
    expect(result.current[2]).toBe('next')
  })

  it('supports an object State source and onChange callback', async () => {
    const onChange = vi.fn()
    const { result, act } = await renderHook(() => useStateThrottled({ value: 'initial', onChange }, 1000))
    await act(async () => result.current[1]('next'))
    expect(onChange).toHaveBeenCalledWith('next')
  })

  it('accepts an updater function from setValue', async () => {
    const { result, act } = await renderHook(() => useStateThrottled(0, 100))

    await act(async () => {
      result.current[1](count => count + 1)
    })
    expect(result.current[0]).toBe(1)
    expect(result.current[2]).toBe(1)
  })

  it('passes changes straight through when delay is 0', async () => {
    const { result, act } = await renderHook(() => useStateThrottled('', 0))

    await act(async () => {
      result.current[1]('a')
    })
    expect(result.current[2]).toBe('a')

    await act(async () => {
      result.current[1]('b')
    })
    expect(result.current[2]).toBe('b')
  })

  it('mirrors the upstream object-ref example', async () => {
    const { result, act } = await renderHook(() => useStateThrottled({ count: 0, name: 'foo' }, 1000))

    // the first change after mount commits on the leading edge
    await act(async () => {
      result.current[1]({ count: 1, name: 'foo' })
    })
    expect(result.current[2]).toEqual({ count: 1, name: 'foo' })

    // rapid changes inside the window stay pending — still the first value
    await act(async () => {
      result.current[1]({ count: 2, name: 'bar' })
    })
    await act(async () => {
      result.current[1]({ count: 3, name: 'baz' })
    })
    await act(async () => {
      result.current[1]({ count: 4, name: 'qux' })
    })
    expect(result.current[2]).toEqual({ count: 1, name: 'foo' })

    // the trailing edge of the window applies the last change
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current[2]).toEqual({ count: 4, name: 'qux' })

    // after a full quiet window the next change commits on the leading edge
    await act(async () => {
      vi.advanceTimersByTime(1001)
    })
    await act(async () => {
      result.current[1]({ count: 5, name: 'final' })
    })
    expect(result.current[2]).toEqual({ count: 5, name: 'final' })
  })
})

describe('useStateThrottled (component)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function UseStateThrottledDemo() {
    const [input, setInput, throttled] = useStateThrottled('start', 1000)

    return (
      <div>
        <button onClick={() => setInput(current => `${current}!`)}>Append</button>
        <p>
          Value:
          {' '}
          {input}
        </p>
        <p>
          Throttled:
          {' '}
          {throttled}
        </p>
      </div>
    )
  }

  it('lags the throttled value behind a burst of updates', async () => {
    const screen = await render(<UseStateThrottledDemo />)
    const append = screen.getByRole('button', { name: 'Append' })

    await append.click()
    await append.click()
    await append.click()

    await expect.element(screen.getByText('Value: start!!!')).toBeVisible()
    // only the leading-edge change has reached `throttled` so far — the rest
    // of the burst collapses into a pending trailing commit (covered by the
    // hook-level tests above, which advance the fake timers)
    await expect.element(screen.getByText('Throttled: start!')).toBeVisible()
  })
})
