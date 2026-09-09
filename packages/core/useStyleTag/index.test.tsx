import type { Dispatch, SetStateAction } from 'react'
import type { UseStyleTagReturn } from '../useStyleTag'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useStyleTag } from '../useStyleTag'

describe('useStyleTag', () => {
  it('should create a style element', async () => {
    const { result, unmount } = await renderHook(() => {
      const [css, setCss, { isLoaded }] = useStyleTag('body { color: red; }', { id: 'test-1' })
      return { css, setCss, isLoaded }
    })

    expect(result.current.isLoaded).toBe(true)
    const el = document.getElementById('test-1') as HTMLStyleElement | null
    expect(el).not.toBeNull()
    expect(el?.textContent).toBe('body { color: red; }')

    await unmount()
  })

  it('should update css when the css setter is called', async () => {
    const { result, act, unmount } = await renderHook(() => {
      const [css, setCss, { isLoaded }] = useStyleTag('body { color: red; }', { id: 'test-2' })
      return { css, setCss, isLoaded }
    })

    expect(document.getElementById('test-2')?.textContent).toBe('body { color: red; }')

    await act(() => {
      result.current.setCss('body { color: blue; }')
    })
    expect(document.getElementById('test-2')?.textContent).toBe('body { color: blue; }')

    await unmount()
  })

  it('should remove style element on unload', async () => {
    const { result, act, unmount } = await renderHook(() => {
      const [css, setCss, { isLoaded, unload }] = useStyleTag('body { color: red; }', { id: 'test-3' })
      return { css, setCss, isLoaded, unload }
    })

    expect(document.getElementById('test-3')).not.toBeNull()

    await act(() => {
      result.current.unload()
    })
    expect(result.current.isLoaded).toBe(false)
    expect(document.getElementById('test-3')).toBeNull()

    await unmount()
  })

  it('should not error when unload is called twice', async () => {
    const { result, act, unmount } = await renderHook(() => {
      const [, , { unload }] = useStyleTag('body { color: red; }', { id: 'test-4' })
      return { unload }
    })

    await act(() => {
      result.current.unload()
    })
    expect(() => result.current.unload()).not.toThrow()

    await unmount()
  })

  it('should not error when unload is called without load', async () => {
    const { result, unmount } = await renderHook(() => {
      const [, , { unload }] = useStyleTag('body { color: red; }', { id: 'test-5', manual: true })
      return { unload }
    })

    expect(() => result.current.unload()).not.toThrow()

    await unmount()
  })

  it('should remove the style element when the component unmounts', async () => {
    const { unmount } = await renderHook(() => useStyleTag('body { color: red; }', { id: 'test-unmount' }))

    expect(document.getElementById('test-unmount')).not.toBeNull()

    await unmount()
    expect(document.getElementById('test-unmount')).toBeNull()
  })

  it('should keep style element when two instances share the same id and only one unmounts', async () => {
    const first = await renderHook(() => useStyleTag('body { color: red; }', { id: 'shared-test' }))
    const second = await renderHook(() => useStyleTag('body { color: blue; }', { id: 'shared-test' }))

    expect(document.getElementById('shared-test')).not.toBeNull()

    // First instance unmounts - element should still exist (second still holds it)
    await first.unmount()
    expect(document.getElementById('shared-test')).not.toBeNull()

    // Second instance unmounts - last reference, element should be removed
    await second.unmount()
    expect(document.getElementById('shared-test')).toBeNull()
  })

  it('should not error when one component unloads and the other stays loaded with shared id', async () => {
    const first = await renderHook(() => {
      const [, , { unload }] = useStyleTag('body { color: red; }', { id: 'shared-test-2' })
      return { unload }
    })
    const second = await renderHook(() => useStyleTag('body { color: blue; }', { id: 'shared-test-2' }))

    await first.act(() => {
      first.result.current.unload()
    })
    expect(document.getElementById('shared-test-2')).not.toBeNull()

    // Second instance is still active, should not error on unmount
    await second.unmount()
    expect(document.getElementById('shared-test-2')).toBeNull()
  })

  it('should create element with media attribute', async () => {
    const { unmount } = await renderHook(() => useStyleTag('body { color: red; }', { id: 'test-media', media: 'print' }))

    const el = document.getElementById('test-media') as HTMLStyleElement | null
    expect(el).not.toBeNull()
    expect(el?.media).toBe('print')

    await unmount()
  })

  it('should set the nonce attribute for CSP when nonce is provided', async () => {
    const { unmount } = await renderHook(() => useStyleTag('body { color: red; }', { id: 'test-nonce', nonce: 'csp-nonce-123' }))

    const el = document.getElementById('test-nonce') as HTMLStyleElement | null
    expect(el).not.toBeNull()
    expect(el?.nonce).toBe('csp-nonce-123')

    await unmount()
  })

  it('should not set the nonce attribute when nonce is omitted', async () => {
    const { unmount } = await renderHook(() => useStyleTag('body { color: red; }', { id: 'test-no-nonce' }))

    const el = document.getElementById('test-no-nonce') as HTMLStyleElement | null
    expect(el).not.toBeNull()
    expect(el?.nonce).toBe('')

    await unmount()
  })

  it('should use a custom document instance', async () => {
    const fakeDocument = document.implementation.createHTMLDocument('fake')
    const { unmount } = await renderHook(() => useStyleTag('body { color: red; }', { id: 'test-doc', document: fakeDocument }))

    // injected into the custom document, not the real one
    expect(document.getElementById('test-doc')).toBeNull()
    const el = fakeDocument.getElementById('test-doc') as HTMLStyleElement | null
    expect(el).not.toBeNull()
    expect(el?.textContent).toBe('body { color: red; }')

    await unmount()
    expect(fakeDocument.getElementById('test-doc')).toBeNull()
  })

  it('should not create element when manual is true', async () => {
    const { result, act, unmount } = await renderHook(() => {
      const [, , { isLoaded, load }] = useStyleTag('body { color: red; }', { id: 'test-manual', manual: true })
      return { isLoaded, load }
    })

    expect(result.current.isLoaded).toBe(false)
    expect(document.getElementById('test-manual')).toBeNull()

    await act(() => {
      result.current.load()
    })
    expect(result.current.isLoaded).toBe(true)
    expect(document.getElementById('test-manual')).not.toBeNull()

    await unmount()
  })

  it('should not create element when immediate is false', async () => {
    const { result, unmount } = await renderHook(() => {
      const [, , { isLoaded }] = useStyleTag('body { color: red; }', { id: 'test-no-immediate', immediate: false })
      return { isLoaded }
    })

    expect(result.current.isLoaded).toBe(false)
    expect(document.getElementById('test-no-immediate')).toBeNull()

    await unmount()
  })

  it('should auto-generate an id with the reaxuse_styletag_ prefix', async () => {
    const { result, unmount } = await renderHook(() => {
      const [, , { id }] = useStyleTag('body { color: red; }')
      return { id }
    })

    expect(result.current.id).toMatch(/^reaxuse_styletag_\d+$/)
    expect(document.getElementById(result.current.id)).not.toBeNull()

    await unmount()
    expect(document.getElementById(result.current.id)).toBeNull()
  })

  it('should return the current css and keep it in sync with the tag', async () => {
    const { result, act, unmount } = await renderHook(() => {
      const [css, setCss, { isLoaded }] = useStyleTag('body { color: red; }', { id: 'test-read' })
      return { css, setCss, isLoaded }
    })

    expect(result.current.css).toBe('body { color: red; }')
    expect(document.getElementById('test-read')?.textContent).toBe(result.current.css)

    await act(() => {
      result.current.setCss('body { color: blue; }')
    })

    expect(result.current.css).toBe('body { color: blue; }')
    expect(document.getElementById('test-read')?.textContent).toBe(result.current.css)

    await unmount()
  })

  it('setCss accepts a functional updater', async () => {
    const { result, act, unmount } = await renderHook(() => {
      const [css, setCss, { isLoaded }] = useStyleTag('a { color: red; }', { id: 'test-updater' })
      return { css, setCss, isLoaded }
    })

    // consecutive updaters in one handler compose against the latest value
    await act(() => {
      result.current.setCss(prev => `${prev}\nb { color: blue; }`)
      result.current.setCss(prev => `${prev}\nc { color: green; }`)
    })

    const expected = 'a { color: red; }\nb { color: blue; }\nc { color: green; }'
    expect(result.current.css).toBe(expected)
    expect(document.getElementById('test-updater')?.textContent).toBe(expected)

    await unmount()
  })

  it('stores the setCss value for the next load when not loaded', async () => {
    const { result, act, unmount } = await renderHook(() => {
      const [css, setCss, { isLoaded, load }] = useStyleTag('body { color: red; }', { id: 'test-store', manual: true })
      return { css, setCss, isLoaded, load }
    })

    expect(document.getElementById('test-store')).toBeNull()

    await act(() => {
      result.current.setCss('body { color: blue; }')
    })

    expect(result.current.css).toBe('body { color: blue; }')
    expect(document.getElementById('test-store')).toBeNull()

    await act(() => {
      result.current.load()
    })

    expect(result.current.isLoaded).toBe(true)
    expect(document.getElementById('test-store')?.textContent).toBe('body { color: blue; }')

    await unmount()
  })

  it('keeps a stable controls object while isLoaded is unchanged', async () => {
    const { result, act, unmount } = await renderHook(() => {
      const [css, setCss, controls] = useStyleTag('body { color: red; }', { id: 'test-controls' })
      return { css, setCss, controls }
    })

    const controls = result.current.controls
    expect(controls.isLoaded).toBe(true)

    await act(() => {
      result.current.setCss('body { color: blue; }')
    })
    expect(result.current.controls).toBe(controls)

    await act(() => {
      result.current.controls.unload()
    })
    expect(result.current.controls).not.toBe(controls)
    expect(result.current.controls.isLoaded).toBe(false)

    await unmount()
  })

  it('types: returns a React tuple [css, setCss, controls]', async () => {
    const { result, unmount } = await renderHook(() => useStyleTag('body { color: red; }'))

    expectTypeOf(result.current).toEqualTypeOf<UseStyleTagReturn>()
    expectTypeOf(result.current[0]).toEqualTypeOf<string>()
    expectTypeOf(result.current[1]).toEqualTypeOf<Dispatch<SetStateAction<string>>>()
    expectTypeOf(result.current[2]).toEqualTypeOf<{
      id: string
      load: () => void
      unload: () => void
      isLoaded: boolean
    }>()
    expectTypeOf(result.current[2].id).toEqualTypeOf<string>()
    expectTypeOf(result.current[2].load).toEqualTypeOf<() => void>()
    expectTypeOf(result.current[2].unload).toEqualTypeOf<() => void>()
    expectTypeOf(result.current[2].isLoaded).toEqualTypeOf<boolean>()

    expect(Array.isArray(result.current)).toBe(true)
    expect(result.current).toHaveLength(3)
    expect(result.current[0]).toBe('body { color: red; }')
    expect(result.current[1]).toBeTypeOf('function')
    expect(result.current[2].id).toMatch(/^reaxuse_styletag_\d+$/)
    expect(result.current[2].isLoaded).toBe(true)
    expect(result.current[2].load).toBeTypeOf('function')
    expect(result.current[2].unload).toBeTypeOf('function')

    await unmount()
  })
})
