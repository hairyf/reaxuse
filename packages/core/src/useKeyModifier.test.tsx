import type { KeyModifier } from './useKeyModifier'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useKeyModifier } from './useKeyModifier'

interface dispatchKeyboardEventOptions extends KeyboardEventInit {
  key?: string
  type?: 'keydown' | 'keyup'
}

/**
 * Dispatch a keyboard event on the document (upstream helper:
 * `source/vueuse/packages/.test/keyboardEvent.ts`).
 */
function dispatchKeyboardEvent(options: dispatchKeyboardEventOptions): void {
  const { type = 'keydown', ...init } = options
  document.dispatchEvent(new KeyboardEvent(type, init))
}

/**
 * Assert useKeyModifier state
 */
async function assertModifierState(key: KeyModifier, options: KeyboardEventInit) {
  const { result, act } = await renderHook(() => useKeyModifier(key))
  expect(result.current).toBeNull()

  await act(() => {
    dispatchKeyboardEvent({ key, ...options })
  })
  expect(result.current).toBeTruthy()

  await act(() => {
    dispatchKeyboardEvent({ key, type: 'keyup' })
  })
  expect(result.current).toBeFalsy()
}

describe('useKeyModifier', () => {
  it('should be defined', () => {
    expect(useKeyModifier).toBeDefined()
  })

  describe('all events', () => {
    // Upstream also tests `FnLock` and `SymbolLock` here, but Chromium does not
    // support the `modifierFnLock` / `modifierSymbolLock` `KeyboardEventInit`
    // keys — `getModifierState` reports `false` for them on synthetic events
    // (see the MDN browser compatibility table), so those two cases can't pass
    // in the browser tests and are excluded below.
    const cases: Array<{ key: KeyModifier, options: KeyboardEventInit }> = [
      { key: 'Alt', options: { altKey: true } },
      { key: 'AltGraph', options: { modifierAltGraph: true } },
      { key: 'CapsLock', options: { modifierCapsLock: true } },
      { key: 'Control', options: { ctrlKey: true } },
      { key: 'Fn', options: { modifierFn: true } },
      { key: 'Meta', options: { metaKey: true } },
      { key: 'NumLock', options: { modifierNumLock: true } },
      { key: 'ScrollLock', options: { modifierScrollLock: true } },
      { key: 'Shift', options: { shiftKey: true } },
      { key: 'Symbol', options: { modifierSymbol: true } },
    ]

    it.for(cases)('should track state for %s', async ({ key, options }) => {
      await assertModifierState(key, options)
    })
  })

  describe('params', () => {
    describe('events', () => {
      it('should allow event to be specified', async () => {
        const { result, act } = await renderHook(() => useKeyModifier('Alt', { events: ['mousedown'] }))
        expect(result.current).toBeNull()

        await act(() => {
          document.dispatchEvent(new MouseEvent('mousedown', { altKey: true }))
        })
        expect(result.current).toBeTruthy()

        await act(() => {
          document.dispatchEvent(new MouseEvent('mousedown', { altKey: false }))
        })
        expect(result.current).toBeFalsy()
      })

      it('should be work with custom event', async () => {
        const { result, act } = await renderHook(() => useKeyModifier('Alt', { events: ['click'] }))
        expect(result.current).toBeNull()

        await act(() => {
          document.dispatchEvent(new MouseEvent('click', { altKey: true }))
        })
        expect(result.current).toBeTruthy()

        await act(() => {
          document.dispatchEvent(new MouseEvent('click', { altKey: false }))
        })
        expect(result.current).toBeFalsy()
      })
    })

    describe('initial', () => {
      it('should be null when initial value is default', async () => {
        const { result } = await renderHook(() => useKeyModifier('Alt'))
        expect(result.current).toBeNull()
      })

      it('should be true when initial value is true', async () => {
        const { result } = await renderHook(() => useKeyModifier('Alt', { initial: true }))
        expect(result.current).toBeTruthy()
      })

      it('should be false when initial value is false', async () => {
        const { result } = await renderHook(() => useKeyModifier('Alt', { initial: false }))
        expect(result.current).toBeFalsy()
      })

      it('should be null when initial value is null', async () => {
        const { result } = await renderHook(() => useKeyModifier('Alt', { initial: null }))
        expect(result.current).toBeFalsy()
      })
    })
  })

  it('supports a custom document option', async () => {
    const listeners: Record<string, Array<(event: KeyboardEvent) => void>> = {}
    const fakeDocument = {
      addEventListener: (type: string, listener: (event: KeyboardEvent) => void) => {
        if (!listeners[type])
          listeners[type] = []
        listeners[type].push(listener)
      },
      removeEventListener: () => {},
    } as unknown as Document

    const { result, act, unmount } = await renderHook(() => useKeyModifier('Alt', { document: fakeDocument }))

    expect(result.current).toBeNull()

    await act(() => {
      listeners.keydown.forEach(listener => listener(new KeyboardEvent('keydown', { altKey: true })))
    })
    expect(result.current).toBeTruthy()

    unmount()
  })

  it('removes its listeners on unmount', async () => {
    const { result, unmount } = await renderHook(() => useKeyModifier('Alt'))
    unmount()

    expect(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { altKey: true }))
      document.dispatchEvent(new KeyboardEvent('keyup', { altKey: false }))
    }).not.toThrow()

    expect(result.current).toBeNull()
  })
})
