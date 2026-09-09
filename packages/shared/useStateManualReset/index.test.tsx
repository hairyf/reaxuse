import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useStateManualReset } from '../useStateManualReset'

it('useStateManualReset should be defined', () => {
  expect(useStateManualReset).toBeDefined()
})

it('useStateManualReset should be default at first', async () => {
  const { result } = await renderHook(() => useStateManualReset('default'))

  expect(result.current[0]).toBe('default')
})

it('useStateManualReset should be updated', async () => {
  const { result, act } = await renderHook(() => useStateManualReset('default'))

  await act(() => result.current[1]('update'))
  expect(result.current[0]).toBe('update')
})

it('useStateManualReset should be reset', async () => {
  const { result, act } = await renderHook(() => useStateManualReset('default'))

  await act(() => result.current[1]('update'))
  expect(result.current[0]).toBe('update')

  await act(() => result.current[2]())
  expect(result.current[0]).toBe('default')
})

it('useStateManualReset supports a controlled state object', async () => {
  let value = 'default'
  const onChange = (next: string) => {
    value = next
  }
  const { result, act, rerender } = await renderHook(() => useStateManualReset({ value, onChange }))

  expect(result.current[0]).toBe('default')
  await act(() => result.current[1]('update'))
  expect(value).toBe('update')
  value = 'default'
  rerender()
  await act(() => result.current[2]())
  expect(value).toBe('default')
})

it('useStateManualReset supports a state tuple', async () => {
  let value = 'default'
  const setValue = (next: string | ((prev: string) => string)) => {
    value = typeof next === 'function' ? next(value) : next
  }
  const { result, act, rerender } = await renderHook(() => useStateManualReset([value, setValue] as const))

  await act(() => result.current[1]('update'))
  value = 'default'
  rerender()
  await act(() => result.current[2]())
  expect(value).toBe('default')
})

it('useStateManualReset re-reads a ref-like default on each reset', async () => {
  const defaultValue = { current: 'default' }
  const { result, act } = await renderHook(() => useStateManualReset(defaultValue))

  expect(result.current[0]).toBe('default')

  await act(() => result.current[1]('update'))
  expect(result.current[0]).toBe('update')

  // upstream re-reads the default via `toValue` on every reset — a new ref
  // value becomes the reset target
  defaultValue.current = 'new default'
  await act(() => result.current[2]())
  expect(result.current[0]).toBe('new default')
})
