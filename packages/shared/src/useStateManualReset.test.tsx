import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useStateManualReset } from './useStateManualReset'

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

it('useStateManualReset re-reads a getter default on each reset', async () => {
  let defaultValue = 'default'
  const { result, act } = await renderHook(() => useStateManualReset(() => defaultValue))

  expect(result.current[0]).toBe('default')

  await act(() => result.current[1]('update'))
  expect(result.current[0]).toBe('update')

  // upstream re-reads the default via `toValue` on every reset — a new getter
  // result becomes the reset target
  defaultValue = 'new default'
  await act(() => result.current[2]())
  expect(result.current[0]).toBe('new default')
})
