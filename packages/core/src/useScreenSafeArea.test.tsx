import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useScreenSafeArea } from './useScreenSafeArea'

it('useScreenSafeArea sets the env() fallback custom properties and reads them back on mount', async () => {
  const { result } = await renderHook(() => useScreenSafeArea())

  // upstream (useCssVar) writes the fallback chains onto documentElement
  expect(document.documentElement.style.getPropertyValue('--vueuse-safe-area-top'))
    .toBe('env(safe-area-inset-top, 0px)')
  expect(document.documentElement.style.getPropertyValue('--vueuse-safe-area-right'))
    .toBe('env(safe-area-inset-right, 0px)')
  expect(document.documentElement.style.getPropertyValue('--vueuse-safe-area-bottom'))
    .toBe('env(safe-area-inset-bottom, 0px)')
  expect(document.documentElement.style.getPropertyValue('--vueuse-safe-area-left'))
    .toBe('env(safe-area-inset-left, 0px)')

  // headless chromium has no real safe-area insets, so every env() fallback
  // resolves to 0px — the values are computed style strings, not numbers
  expect(result.current.top).toBe('0px')
  expect(result.current.right).toBe('0px')
  expect(result.current.bottom).toBe('0px')
  expect(result.current.left).toBe('0px')
})

it('useScreenSafeArea re-reads the computed values through update()', async () => {
  const { result, act } = await renderHook(() => useScreenSafeArea())

  document.documentElement.style.setProperty('--vueuse-safe-area-top', '10px')
  document.documentElement.style.setProperty('--vueuse-safe-area-bottom', '5px')

  await act(() => {
    result.current.update()
  })

  expect(result.current.top).toBe('10px')
  expect(result.current.bottom).toBe('5px')
})

it('useScreenSafeArea refreshes on the debounced window resize listener', async () => {
  const { result } = await renderHook(() => useScreenSafeArea())

  document.documentElement.style.setProperty('--vueuse-safe-area-left', '20px')
  window.dispatchEvent(new Event('resize'))

  // upstream debounces the resize-triggered update (useDebounceFn default 200ms)
  await expect.poll(() => result.current.left, { timeout: 2000, interval: 100 }).toBe('20px')
})

it('useScreenSafeArea keeps the custom properties but drops the resize listener on unmount', async () => {
  const { result, unmount } = await renderHook(() => useScreenSafeArea())
  const topBefore = result.current.top
  unmount()

  // upstream (useCssVar) does not restore documentElement on dispose
  expect(document.documentElement.style.getPropertyValue('--vueuse-safe-area-top'))
    .toBe('env(safe-area-inset-top, 0px)')

  expect(() => {
    document.documentElement.style.setProperty('--vueuse-safe-area-top', '30px')
    window.dispatchEvent(new Event('resize'))
  }).not.toThrow()

  // if the listener had survived, the debounced update would have fired by now
  await new Promise(resolve => setTimeout(resolve, 400))
  expect(result.current.top).toBe(topBefore)
})
