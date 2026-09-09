import { useState } from 'react'
import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useToggle } from '../useToggle'

it('useToggle toggles between states', async () => {
  const { result, act } = await renderHook(() => useToggle())

  expect(result.current[0]).toBe(false)

  await act(() => result.current[1]())
  expect(result.current[0]).toBe(true)

  await act(() => result.current[1](false))
  expect(result.current[0]).toBe(false)
})

it('useToggle supports a controllable state tuple', async () => {
  const { result, act } = await renderHook(() => {
    const state = useState(false)
    const toggle = useToggle(state)
    return { state, toggle }
  })

  expect(result.current.toggle[0]).toBe(false)
  await act(() => result.current.toggle[1]())
  expect(result.current.toggle[0]).toBe(true)
  expect(result.current.state[0]).toBe(true)
})

it('useToggle flips between custom truthy and falsy values', async () => {
  const { result, act } = await renderHook(() =>
    useToggle('on' as 'on' | 'off', { truthyValue: 'on', falsyValue: 'off' }))

  expect(result.current[0]).toBe('on')

  await act(() => result.current[1]())
  expect(result.current[0]).toBe('off')

  await act(() => result.current[1]())
  expect(result.current[0]).toBe('on')
})

it('useToggle treats an explicit undefined argument as a forced value (upstream arguments.length)', async () => {
  const { result, act } = await renderHook(() => useToggle())

  await act(() => result.current[1](undefined))
  expect(result.current[0]).toBeUndefined()

  await act(() => result.current[1](true))
  expect(result.current[0]).toBe(true)
})

it('useToggle supports a functional update', async () => {
  const { result, act } = await renderHook(() => useToggle('a' as 'a' | 'b'))

  await act(() => result.current[1](current => (current === 'a' ? 'b' : 'a')))
  expect(result.current[0]).toBe('b')

  await act(() => result.current[1](current => (current === 'a' ? 'b' : 'a')))
  expect(result.current[0]).toBe('a')
})
