import { renderHook } from 'vitest-browser-react'
import { expect, test } from 'vitest'
import { useNow } from './useNow'

test('useNow returns a recent timestamp', async () => {
  const before = Date.now()
  const { result } = await renderHook(() => useNow(1000))

  expect(result.current).toBeGreaterThanOrEqual(before)
  expect(result.current).toBeLessThanOrEqual(Date.now() + 1000)
})

test('useNow advances over time', async () => {
  const { result } = await renderHook(() => useNow(50))
  const first = result.current

  await new Promise(resolve => setTimeout(resolve, 120))
  expect(result.current).toBeGreaterThan(first)
})
