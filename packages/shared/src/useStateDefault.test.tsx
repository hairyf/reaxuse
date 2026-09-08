import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useStateDefault } from './useStateDefault'

describe('useStateDefault', () => {
  it('should be defined', () => {
    expect(useStateDefault).toBeDefined()
  })

  it('shows the default value when the source is undefined', async () => {
    const raw = { current: undefined as string | undefined }
    const { result } = await renderHook(() => useStateDefault(raw, 'default'))

    const [value, setValue] = result.current
    expect(value).toBe('default')
    expect(typeof setValue).toBe('function')
  })

  it('shows the default value when the source is null', async () => {
    const raw = { current: null as string | null }
    const { result } = await renderHook(() => useStateDefault(raw, 'default'))

    expect(result.current[0]).toBe('default')
  })

  it('shows the source value when it is set', async () => {
    const raw = { current: 'hello' as string | null }
    const { result } = await renderHook(() => useStateDefault(raw, 'default'))

    expect(result.current[0]).toBe('hello')
  })

  it('shows the source value when it is falsy but not nullish', async () => {
    const raw = { current: '' as string | null }
    const { result } = await renderHook(() => useStateDefault(raw, 'default'))

    expect(result.current[0]).toBe('')
  })

  it('updates the value and writes through to the source', async () => {
    const raw = { current: undefined as string | undefined }
    const { result, act } = await renderHook(() => useStateDefault(raw, 'default'))

    expect(result.current[0]).toBe('default')

    await act(async () => {
      result.current[1]('hello')
    })
    expect(result.current[0]).toBe('hello')
    expect(raw.current).toBe('hello')
  })

  it('falls back to the default when set to undefined or null', async () => {
    const raw = { current: undefined as string | undefined }
    const { result, act } = await renderHook(() => useStateDefault(raw, 'default'))

    await act(async () => {
      result.current[1]('hello')
    })
    expect(result.current[0]).toBe('hello')

    await act(async () => {
      result.current[1](undefined)
    })
    expect(result.current[0]).toBe('default')
    expect(raw.current).toBeUndefined()

    await act(async () => {
      result.current[1](null)
    })
    expect(result.current[0]).toBe('default')
    expect(raw.current).toBeNull()
  })

  it('accepts an updater function from setValue', async () => {
    const raw = { current: 0 as number | null }
    const { result, act } = await renderHook(() => useStateDefault(raw, 0))

    await act(async () => {
      result.current[1](current => (current ?? 0) + 1)
    })
    expect(result.current[0]).toBe(1)
    expect(raw.current).toBe(1)
  })

  it('resolves plain values for the source input', async () => {
    const { result, act } = await renderHook(() => useStateDefault('initial' as string | undefined, 'default'))

    expect(result.current[0]).toBe('initial')

    // a plain-value source is read-only — setValue cannot write back to it, so
    // `value` keeps deriving from the source (upstream derives from the ref it
    // receives; only ref-like sources support the write-through)
    await act(async () => {
      result.current[1]('set')
    })
    expect(result.current[0]).toBe('initial')
  })

  it('reflects external writes to the ref-like source on re-render', async () => {
    const raw = { current: undefined as string | undefined }
    const { result, rerender } = await renderHook(() => useStateDefault(raw, 'default'))

    expect(result.current[0]).toBe('default')

    raw.current = 'from outside'
    await rerender()
    expect(result.current[0]).toBe('from outside')
  })

  it('is SSR safe — renderToString produces the default value without effects', async () => {
    const raw = { current: undefined as string | undefined }

    function SSRStateDefault() {
      const [value] = useStateDefault(raw, 'default')
      return <div>{value}</div>
    }

    const html = await renderToString(<SSRStateDefault />)
    expect(html).toContain('default')
  })
})

describe('useStateDefault (component)', () => {
  const raw: { current: string | undefined } = { current: undefined }

  function UseStateDefaultDemo() {
    const [value, setValue] = useStateDefault(raw, 'default')

    return (
      <div>
        <button onClick={() => setValue('hello')}>Set hello</button>
        <button onClick={() => setValue(undefined)}>Clear</button>
        <p>
          Value:
          {' '}
          {value}
        </p>
      </div>
    )
  }

  it('shows the default and reacts to setValue', async () => {
    const screen = await render(<UseStateDefaultDemo />)
    const setHello = screen.getByRole('button', { name: 'Set hello' })
    const clear = screen.getByRole('button', { name: 'Clear' })

    await expect.element(screen.getByText('Value: default')).toBeVisible()

    await setHello.click()
    await expect.element(screen.getByText('Value: hello')).toBeVisible()
    expect(raw.current).toBe('hello')

    await clear.click()
    await expect.element(screen.getByText('Value: default')).toBeVisible()
    expect(raw.current).toBeUndefined()
  })
})
