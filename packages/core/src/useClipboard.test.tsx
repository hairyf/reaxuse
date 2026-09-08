import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useClipboard } from './useClipboard'
import { usePermission } from './usePermission'

describe('useClipboard', () => {
  it('should be defined', () => {
    expect(useClipboard).toBeDefined()
  })

  it('should be supported', async () => {
    const { result } = await renderHook(() => useClipboard())
    await expect.poll(() => result.current.isSupported).toBe(true)
  })

  describe('without permissions', () => {
    it('should write to legacy clipboard', async () => {
      const { result: writePermission } = await renderHook(() => usePermission('clipboard-write'))
      // reaxuse port: the permission state starts at `'prompt'` and no
      // clipboard permission is actively granted in the test environment —
      // mirroring upstream's `undefined` assertion that no permission is
      // available, so `copy` exercises the legacy `execCommand` fallback
      await expect.poll(() => writePermission.current).toBe('prompt')

      const { result } = await renderHook(() => useClipboard())
      expect(result.current.text).toBe('')
      expect(result.current.copied).toBe(false)

      await result.current.copy('hello')

      await expect.poll(() => result.current.text).toBe('hello')
      await expect.poll(() => result.current.copied).toBe(true)
    })

    it('should copy text from async function', async () => {
      const { result } = await renderHook(() => useClipboard())
      expect(result.current.text).toBe('')
      expect(result.current.copied).toBe(false)

      const promise = result.current.copy(async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
        return 'async text'
      })
      await expect.poll(() => result.current.copyPending, { interval: 10 }).toBe(true)

      await promise

      await expect.poll(() => result.current.text).toBe('async text')
      await expect.poll(() => result.current.copied).toBe(true)
    })

    it.todo('should read from legacy clipboard')
  })

  describe('with permissions', () => {
    // todo: mock navigator permissions
    it.todo('should write to clipboard')

    it.todo('should read from clipboard')

    it.todo('should fall back to legacy clipboard if write fails')

    it.todo('should fall back to legacy clipboard if read fails')
  })
})
