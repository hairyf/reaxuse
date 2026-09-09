import type { Dispatch, SetStateAction } from 'react'
import type { UseFaviconReturn } from '../useFavicon'
import { beforeEach, describe, expect, expectTypeOf, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useFavicon } from '../useFavicon'

function faviconLink() {
  return document.head.querySelector<HTMLLinkElement>('link[rel*="icon"]')
}

describe('useFavicon', () => {
  // the hook manages the real <head> — start every test from a clean slate
  beforeEach(() => {
    document.head.querySelectorAll('link[rel*="icon"]').forEach(el => el.remove())
  })

  it('no param', async () => {
    const { result, act } = await renderHook(() => useFavicon())

    expect(result.current[0]).toBe(null)

    await act(() => {
      result.current[1]('https://www.google.at/favicon.ico')
    })
    expect(result.current[0]).toBe('https://www.google.at/favicon.ico')
    expect(faviconLink()?.getAttribute('href')).toBe('https://www.google.at/favicon.ico')
    expect(faviconLink()?.type).toBe('image/ico')
  })

  it('const', async () => {
    const { result, act } = await renderHook(() => useFavicon('v1'))

    expect(result.current[0]).toBe('v1')

    await act(() => {
      result.current[1]('v2')
    })
    expect(result.current[0]).toBe('v2')
    expect(faviconLink()?.getAttribute('href')).toBe('v2')
  })

  it('null', async () => {
    const { result, act } = await renderHook(() => useFavicon(null))

    expect(result.current[0]).toBe(null)

    await act(() => {
      result.current[1]('v1')
    })
    expect(result.current[0]).toBe('v1')
  })

  it('undefined', async () => {
    const { result, act } = await renderHook(() => useFavicon(undefined))

    expect(result.current[0]).toBe(null)

    await act(() => {
      result.current[1]('v1')
    })
    expect(result.current[0]).toBe('v1')
  })

  it('treats a plain value as the initial value only (the setter owns the state afterwards)', async () => {
    const { result, rerender } = await renderHook(
      (props: { icon: string | null | undefined } = { icon: null }) => useFavicon(props.icon),
      { initialProps: { icon: 'v1' } },
    )

    expect(result.current[0]).toBe('v1')

    // upstream's `toRef(plainValue)` is static too — a new argument is not
    // adopted; call the returned setter instead
    await rerender({ icon: 'v2' })
    expect(result.current[0]).toBe('v1')
  })

  it('resolves functional updaters against React state (setter-updater alignment)', async () => {
    const { result, act } = await renderHook(() => useFavicon('v1'))

    // the setter forwards the updater untouched — React applies it against its
    // own state, so interleaved writes never diverge from the applied favicon
    await act(() => {
      result.current[1](prev => `${prev}-v2`)
    })
    expect(result.current[0]).toBe('v1-v2')
    expect(faviconLink()?.getAttribute('href')).toBe('v1-v2')

    await act(() => {
      result.current[1](prev => `${prev}-v3`)
    })
    expect(result.current[0]).toBe('v1-v2-v3')
    expect(faviconLink()?.getAttribute('href')).toBe('v1-v2-v3')
  })

  it('types: returns a writable [icon, setIcon] tuple', async () => {
    const { result } = await renderHook(() => useFavicon())

    expectTypeOf(result.current).toEqualTypeOf<UseFaviconReturn>()
    expectTypeOf(result.current[0]).toEqualTypeOf<string | null | undefined>()
    expectTypeOf(result.current[1]).toEqualTypeOf<Dispatch<SetStateAction<string | null | undefined>>>()
  })

  describe('options', () => {
    it('prepends baseUrl to the applied href', async () => {
      const { act } = await renderHook(() => useFavicon('v1', { baseUrl: '/base/' }))

      expect(faviconLink()?.getAttribute('href')).toBe('/base/v1')

      await act(() => {
        // keep the hook mounted — the assertion above covers the mount apply
      })
    })

    it('supports a custom rel', async () => {
      const { act } = await renderHook(() => useFavicon('v1', { rel: 'apple-touch-icon' }))

      const link = document.head.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')
      expect(link?.getAttribute('href')).toBe('v1')
      expect(link?.type).toBe('image/v1')

      await act(() => {
        // keep the hook mounted — the assertion above covers the mount apply
      })
    })

    it('supports a custom document', async () => {
      const fakeDocument = document.implementation.createHTMLDocument('fake')
      const { result, act } = await renderHook(() => useFavicon('v1', { document: fakeDocument }))

      expect(document.head.querySelector('link[rel*="icon"]')).toBe(null)
      expect(fakeDocument.head.querySelector('link[rel*="icon"]')?.getAttribute('href')).toBe('v1')

      await act(() => {
        result.current[1]('v2')
      })
      expect(fakeDocument.head.querySelector('link[rel*="icon"]')?.getAttribute('href')).toBe('v2')
      expect(document.head.querySelector('link[rel*="icon"]')).toBe(null)
    })
  })
})
