import { renderHook } from 'vitest-browser-react'
import { expect, test } from 'vitest'
import { useToggle } from './useToggle'

test('useToggle toggles between states', async () => {
  const { result, act } = await renderHook(() => useToggle())

  expect(result.current[0]).toBe(false)

  await act(() => result.current[1]())
  expect(result.current[0]).toBe(true)

  await act(() => result.current[1](false))
  expect(result.current[0]).toBe(false)
})

test('useToggle supports initial value and functional update', async () => {
  const { result, act } = await renderHook(() => useToggle('a' as 'a' | 'b'))

  expect(result.current[0]).toBe('a')

  await act(() => result.current[1]())
  expect(result.current[0]).toBe(false)

  await act(() => result.current[1](current => (current === 'a' ? 'b' : 'a')))
  expect(result.current[0]).toBe('a')
})
