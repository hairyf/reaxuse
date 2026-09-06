import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useStyleTag } from './useStyleTag'

describe('useStyleTag', () => {
  it('should create a style element', async () => {
    const { result, unmount } = await renderHook(() => useStyleTag('body { color: red; }', { id: 'test-1' }))

    expect(result.current.isLoaded).toBe(true)
    const el = document.getElementById('test-1') as HTMLStyleElement | null
    expect(el).not.toBeNull()
    expect(el?.textContent).toBe('body { color: red; }')

    await unmount()
  })

  it('should update css when the css setter is called', async () => {
    const { result, act, unmount } = await renderHook(() => useStyleTag('body { color: red; }', { id: 'test-2' }))

    expect(document.getElementById('test-2')?.textContent).toBe('body { color: red; }')

    await act(() => {
      result.current.css('body { color: blue; }')
    })
    expect(document.getElementById('test-2')?.textContent).toBe('body { color: blue; }')

    await unmount()
  })

  it('should remove style element on unload', async () => {
    const { result, act, unmount } = await renderHook(() => useStyleTag('body { color: red; }', { id: 'test-3' }))

    expect(document.getElementById('test-3')).not.toBeNull()

    await act(() => {
      result.current.unload()
    })
    expect(result.current.isLoaded).toBe(false)
    expect(document.getElementById('test-3')).toBeNull()

    await unmount()
  })

  it('should not error when unload is called twice', async () => {
    const { result, act, unmount } = await renderHook(() => useStyleTag('body { color: red; }', { id: 'test-4' }))

    await act(() => {
      result.current.unload()
    })
    expect(() => result.current.unload()).not.toThrow()

    await unmount()
  })

  it('should not error when unload is called without load', async () => {
    const { result, unmount } = await renderHook(() => useStyleTag('body { color: red; }', { id: 'test-5', manual: true }))

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
    const first = await renderHook(() => useStyleTag('body { color: red; }', { id: 'shared-test-2' }))
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

  it('should not create element when manual is true', async () => {
    const { result, act, unmount } = await renderHook(() => useStyleTag('body { color: red; }', { id: 'test-manual', manual: true }))

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
    const { result, unmount } = await renderHook(() => useStyleTag('body { color: red; }', { id: 'test-no-immediate', immediate: false }))

    expect(result.current.isLoaded).toBe(false)
    expect(document.getElementById('test-no-immediate')).toBeNull()

    await unmount()
  })

  it('should auto-generate an id with the reaxuse_styletag_ prefix', async () => {
    const { result, unmount } = await renderHook(() => useStyleTag('body { color: red; }'))

    expect(result.current.id).toMatch(/^reaxuse_styletag_\d+$/)
    expect(document.getElementById(result.current.id)).not.toBeNull()

    await unmount()
    expect(document.getElementById(result.current.id)).toBeNull()
  })
})
