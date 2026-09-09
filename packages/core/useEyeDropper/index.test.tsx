import type { EyeDropperOpenOptions } from '../useEyeDropper'
import { afterEach, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useEyeDropper } from '../useEyeDropper'

/**
 * Installs a fake `window.EyeDropper` whose `open()` resolves with a fixed
 * sRGB hex. Returns a spy on the instance `open` method.
 */
function installFakeEyeDropper(hex: string) {
  const openSpy = vi.fn(async (_options?: EyeDropperOpenOptions) => ({ sRGBHex: hex }))

  class FakeEyeDropper {
    open = openSpy
  }

  vi.stubGlobal('EyeDropper', FakeEyeDropper)
  return openSpy
}

afterEach(() => {
  vi.unstubAllGlobals()
})

it('should be defined', () => {
  expect(useEyeDropper).toBeDefined()
})

it('useEyeDropper reports support matching the environment', async () => {
  const isSupportedInEnv = typeof window !== 'undefined' && 'EyeDropper' in window
  const { result } = await renderHook(() => useEyeDropper())

  await expect.poll(() => result.current.isSupported).toBe(isSupportedInEnv)
})

it('useEyeDropper initializes sRGBHex with the initialValue option', async () => {
  const { result } = await renderHook(() => useEyeDropper({ initialValue: '#abcdef' }))

  expect(result.current.sRGBHex).toBe('#abcdef')
})

it('open() resolves with the picked color and updates sRGBHex', async () => {
  const openSpy = installFakeEyeDropper('#ff6600')

  const { result, act } = await renderHook(() => useEyeDropper())

  await expect.poll(() => result.current.isSupported).toBe(true)
  expect(result.current.sRGBHex).toBe('')

  const signal = new AbortController().signal
  let picked: { sRGBHex: string } | undefined
  await act(async () => {
    picked = await result.current.open({ signal })
  })

  expect(picked).toEqual({ sRGBHex: '#ff6600' })
  expect(result.current.sRGBHex).toBe('#ff6600')
  expect(openSpy).toHaveBeenCalledTimes(1)
  expect(openSpy).toHaveBeenCalledWith({ signal })
})

it('open() resolves undefined and leaves sRGBHex untouched when unsupported', async () => {
  const original = Object.getOwnPropertyDescriptor(window, 'EyeDropper')
  const hadEyeDropper = 'EyeDropper' in window
  if (hadEyeDropper)
    Reflect.deleteProperty(window, 'EyeDropper')

  try {
    const { result, act } = await renderHook(() => useEyeDropper({ initialValue: '#000000' }))

    await expect.poll(() => result.current.isSupported).toBe(false)

    let picked: { sRGBHex: string } | undefined
    await act(async () => {
      picked = await result.current.open()
    })
    expect(picked).toBeUndefined()
    expect(result.current.sRGBHex).toBe('#000000')
  }
  finally {
    if (original)
      Object.defineProperty(window, 'EyeDropper', original)
  }
})

it('keeps SSR-safe defaults during render and resolves in a mount effect', async () => {
  installFakeEyeDropper('#000000')

  const values: Array<{ isSupported: boolean, sRGBHex: string }> = []

  function Probe() {
    const { isSupported, sRGBHex } = useEyeDropper({ initialValue: '#123456' })
    values.push({ isSupported, sRGBHex })

    return <div>{isSupported ? 'supported' : 'unsupported'}</div>
  }

  const screen = await render(<Probe />)

  // render-time values are the SSR-safe defaults
  expect(values[0].isSupported).toBe(false)
  expect(values[0].sRGBHex).toBe('#123456')

  // the mount effect probes the API and re-renders
  await expect.element(screen.getByText('supported')).toBeVisible()
  expect(values[values.length - 1].isSupported).toBe(true)
  expect(values[values.length - 1].sRGBHex).toBe('#123456')
})
