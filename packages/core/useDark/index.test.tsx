import type { BasicColorSchema } from '../useColorMode'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useDark } from '../useDark'

describe('useDark', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('updates html element by default', async () => {
    const { result, act } = await renderHook(() => useDark({ initialValue: 'light' }))

    expect(result.current[0]).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    await act(() => {
      result.current[1]()
    })

    expect(result.current[0]).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('updates custom element', async () => {
    const { result, act } = await renderHook(() => useDark({
      initialValue: 'light',
      selector: 'body',
    }))

    expect(result.current[0]).toBe(false)
    expect(document.body.classList.contains('dark')).toBe(false)

    await act(() => {
      result.current[1]()
    })

    expect(result.current[0]).toBe(true)
    expect(document.body.classList.contains('dark')).toBe(true)
  })

  it('updates custom storage key', async () => {
    const { result, act } = await renderHook(() => useDark({
      initialValue: 'light',
      storageKey: 'custom-key',
    }))

    expect(localStorage.getItem('custom-key')).toBe('light')

    await act(() => {
      result.current[1]()
    })

    expect(localStorage.getItem('custom-key')).toBe('dark')
  })

  it('sets custom class name', async () => {
    const { result, act } = await renderHook(() => useDark({
      initialValue: 'light',
      valueDark: 'custom-dark',
      valueLight: 'custom-light',
    }))

    expect(result.current[0]).toBe(false)
    expect(document.documentElement.classList.contains('custom-dark')).toBe(false)
    expect(document.documentElement.classList.contains('custom-light')).toBe(true)

    await act(() => {
      result.current[1]()
    })

    expect(result.current[0]).toBe(true)
    expect(document.documentElement.classList.contains('custom-dark')).toBe(true)
    expect(document.documentElement.classList.contains('custom-light')).toBe(false)
  })

  it('calls custom change handler', async () => {
    let ready = false

    const onChanged = vi.fn((val: boolean, defaultHandler: (mode: BasicColorSchema) => void, mode: BasicColorSchema) => {
      if (!ready)
        return // <- ignore immediate watch calls, only assert our changes

      expect(val).toBe(true)
      expect(defaultHandler).toBeInstanceOf(Function)
      expect(mode).toBe('dark')
      defaultHandler(mode)
    })

    const { result, act } = await renderHook(() => useDark({
      initialValue: 'light',
      onChanged,
    }))

    ready = true
    await act(() => {
      result.current[1]()
    })

    expect(onChanged).toHaveBeenCalled()
  })

  it('component', async () => {
    // The upstream `UseDark` Vue component wrapper has no React port; this
    // exercises the same behavior — a component calling `toggleDark` — through
    // the hook directly.
    function Probe() {
      const [isDark, toggleDark] = useDark({ initialValue: 'light' })
      return <button onClick={toggleDark}>{isDark ? 'Dark' : 'Light'}</button>
    }

    const screen = await render(<Probe />)
    const button = screen.getByRole('button', { name: 'Light' })

    expect(document.documentElement.classList.contains('dark')).toBe(false)

    await button.click()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(screen.getByRole('button', { name: 'Dark' }).query()).not.toBeNull()
  })
})
