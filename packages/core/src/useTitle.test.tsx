import type { Dispatch, SetStateAction } from 'react'
import type { UseTitleReturn } from './useTitle'
import { beforeEach, describe, expect, expectTypeOf, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useTitle } from './useTitle'

const defaultTitle = 'VueUse testing'

describe('useTitle', () => {
  beforeEach(() => {
    document.title = defaultTitle
  })

  it('without param', async () => {
    const { result, act } = await renderHook(() => useTitle())

    expect(result.current[0]).toBe(defaultTitle)
    expect(document.title).toBe(defaultTitle)

    await act(() => {
      result.current[1]('new title')
    })
    expect(result.current[0]).toBe('new title')
    expect(document.title).toBe('new title')
  })

  describe('with writable param', () => {
    it('string', async () => {
      const { result, act } = await renderHook(() => useTitle('old title'))

      expect(result.current[0]).toBe('old title')
      expect(document.title).toBe('old title')

      await act(() => {
        result.current[1]('new title')
      })
      expect(result.current[0]).toBe('new title')
      expect(document.title).toBe('new title')
    })

    it('null', async () => {
      const { result, act } = await renderHook(() => useTitle(null))

      expect(result.current[0]).toBe(defaultTitle)

      await act(() => {
        result.current[1]('new title')
      })
      expect(result.current[0]).toBe('new title')
      expect(document.title).toBe('new title')
    })

    it('undefined', async () => {
      const { result } = await renderHook(() => useTitle(undefined))

      expect(result.current[0]).toBe(defaultTitle)
    })
  })

  it('re-render with a new title argument updates document.title', async () => {
    const { result, rerender } = await renderHook(
      (props?: { title?: string }) => useTitle(props?.title),
      { initialProps: { title: 'old title' } },
    )

    expect(result.current[0]).toBe('old title')
    expect(document.title).toBe('old title')

    await rerender({ title: 'new title' })
    expect(result.current[0]).toBe('new title')
    expect(document.title).toBe('new title')
  })

  it('setting null through the setter leaves document.title untouched', async () => {
    const { result, act } = await renderHook(() => useTitle('old title'))

    await act(() => {
      result.current[1](null)
    })
    expect(result.current[0]).toBe(null)
    expect(document.title).toBe('old title')
  })

  it('types: returns a writable [title, setTitle] tuple', async () => {
    const { result } = await renderHook(() => useTitle())

    expectTypeOf(result.current).toEqualTypeOf<UseTitleReturn>()
    expectTypeOf(result.current[0]).toEqualTypeOf<string | null | undefined>()
    expectTypeOf(result.current[1]).toEqualTypeOf<Dispatch<SetStateAction<string | null | undefined>>>()
  })

  describe('options params', () => {
    describe('titleTemplate', () => {
      it('string', async () => {
        const { result, act } = await renderHook(() => useTitle('old title', { titleTemplate: '%s | My Website' }))

        expect(document.title).toBe('old title | My Website')
        expect(result.current[0]).toBe('old title')

        await act(() => {
          result.current[1]('new title')
        })
        expect(document.title).toBe('new title | My Website')
        expect(result.current[0]).toBe('new title')
      })

      it('empty string', async () => {
        const { result } = await renderHook(() => useTitle('old title', { titleTemplate: '' }))

        expect(document.title).toBe('old title')
        expect(result.current[0]).toBe('old title')
      })

      it('function', async () => {
        const { result, act } = await renderHook(() => useTitle('old title', { titleTemplate: (t: string) => `${t} | My Website` }))

        expect(document.title).toBe('old title | My Website')
        expect(result.current[0]).toBe('old title')

        await act(() => {
          result.current[1]('new title')
        })
        expect(document.title).toBe('new title | My Website')
        expect(result.current[0]).toBe('new title')
      })
    })

    describe('observe', () => {
      it('should not be updated if used default value', async () => {
        const { result, act } = await renderHook(() => useTitle('old title'))

        await act(async () => {
          document.title = 'new title'
          await new Promise(resolve => setTimeout(resolve, 10))
        })

        expect(result.current[0]).toBe('old title')
      })

      it('should not be updated if observe is false', async () => {
        const { result, act } = await renderHook(() => useTitle('old title', { observe: false }))

        await act(async () => {
          document.title = 'new title'
          await new Promise(resolve => setTimeout(resolve, 10))
        })

        expect(result.current[0]).toBe('old title')
      })

      it('should be update if document.title changes', async () => {
        const { result, act } = await renderHook(() => useTitle('old title', { observe: true }))

        await act(async () => {
          document.title = 'new title'
          await new Promise(resolve => setTimeout(resolve, 10))
        })

        expect(result.current[0]).toBe('new title')
        expect(document.title).toBe('new title')
      })
    })

    describe('restoreOnUnmount', () => {
      it('should be new value if restoreOnUnmount is false', async () => {
        const { result, act, unmount } = await renderHook(() => useTitle('origin title', { restoreOnUnmount: false }))

        await act(() => {
          result.current[1]('new title')
        })
        expect(result.current[0]).toBe('new title')

        unmount()
        expect(document.title).toBe('new title')
      })

      it('should be restored if title not modified and restoreOnUnmount return null', async () => {
        const { unmount } = await renderHook(() => useTitle('origin title', { restoreOnUnmount: () => null }))

        unmount()
        expect(document.title).toBe('origin title')
      })

      it('should be restored if restoreOnUnmount has return value', async () => {
        const { result, act, unmount } = await renderHook(() => useTitle('origin title', { restoreOnUnmount: () => 'restored title' }))

        await act(() => {
          result.current[1]('new title')
        })

        unmount()
        expect(document.title).toBe('restored title')
      })

      it('restores the original title by default', async () => {
        const { result, act, unmount } = await renderHook(() => useTitle('new title'))

        expect(document.title).toBe('new title')

        await act(() => {
          result.current[1]('latest title')
        })

        unmount()
        expect(document.title).toBe(defaultTitle)
      })
    })

    it('supports a custom document option', async () => {
      const fakeDocument = { title: 'fake original' } as Document
      const { result, act, unmount } = await renderHook(() => useTitle('hello', { document: fakeDocument }))

      expect(fakeDocument.title).toBe('hello')
      expect(document.title).toBe(defaultTitle)

      await act(() => {
        result.current[1]('changed')
      })
      expect(fakeDocument.title).toBe('changed')
      expect(document.title).toBe(defaultTitle)

      unmount()
      expect(fakeDocument.title).toBe('fake original')
    })
  })
})
