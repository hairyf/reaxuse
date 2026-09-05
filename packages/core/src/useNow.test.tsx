import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useNow } from './useNow'

it('useNow returns a recent timestamp', async () => {
  const before = Date.now()
  const { result } = await renderHook(() => useNow(1000))

  expect(result.current).toBeGreaterThanOrEqual(before)
  expect(result.current).toBeLessThanOrEqual(Date.now() + 1000)
})

it('useNow advances over time', async () => {
  const { result } = await renderHook(() => useNow(50))
  const first = result.current

  await new Promise(resolve => setTimeout(resolve, 120))
  expect(result.current).toBeGreaterThan(first)
})
