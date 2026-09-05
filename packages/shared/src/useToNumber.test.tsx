import { expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useToNumber } from './useToNumber'

it('useToNumber converts with the default parseFloat method', async () => {
  let value: string | number = '123.345'
  const { result, rerender } = await renderHook(() => useToNumber(value))

  expect(result.current).toBe(123.345)

  value = 'hi'
  await rerender()
  expect(result.current).toBe(Number.NaN)

  value = 123.4
  await rerender()
  expect(result.current).toBe(123.4)

  value = '-43.53'
  await rerender()
  expect(result.current).toBe(-43.53)
})

it('useToNumber converts with parseInt', async () => {
  let value: string | number = '123.345'
  const { result, rerender } = await renderHook(() =>
    useToNumber(value, { method: 'parseInt' }))

  expect(result.current).toBe(123)

  value = 'hi'
  await rerender()
  expect(result.current).toBe(Number.NaN)

  value = 123.4
  await rerender()
  expect(result.current).toBe(123.4)

  value = '-43.53'
  await rerender()
  expect(result.current).toBe(-43)
})

it('useToNumber respects radix with parseInt', async () => {
  const { result } = await renderHook(
    () => useToNumber('0xFA', { method: 'parseInt', radix: 16 }),
  )

  expect(result.current).toBe(250)
})

it('useToNumber keeps NaN by default', async () => {
  const { result } = await renderHook(() => useToNumber('Hi'))

  expect(result.current).toBe(Number.NaN)
})

it('useToNumber replaces NaN with zero when nanToZero is set', async () => {
  const { result } = await renderHook(() => useToNumber('Hi', { nanToZero: true }))

  expect(result.current).toBe(0)
})

it('useToNumber passes number values through untouched', async () => {
  let value: string | number = 123.4
  const { result, rerender } = await renderHook(() =>
    useToNumber(value, { method: 'parseInt' }))

  expect(result.current).toBe(123.4)

  value = 42
  await rerender()
  expect(result.current).toBe(42)
})

it('useToNumber supports a custom method function', async () => {
  const warn = vi.fn()
  const method = (value: string | number) => {
    if (!Number.isSafeInteger(Number(value)))
      warn('Value is not a safe integer')
    return 0
  }

  const { result } = await renderHook(
    () => useToNumber(`${Number.MAX_SAFE_INTEGER}1`, { method }),
  )

  expect(result.current).toBe(0)
  expect(warn).toHaveBeenCalledTimes(1)
  expect(warn).toHaveBeenCalledWith('Value is not a safe integer')
})
