import type { IpcRenderer, IpcRendererEvent } from 'electron'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useIpcRendererOn } from '../useIpcRendererOn'

/**
 * Build a fake `ipcRenderer` from `vi.fn()`s. The upstream modules import
 * `electron` **type-only** (`import type { IpcRenderer } from 'electron'`) and
 * resolve the runtime through `window.require('electron')`, so no
 * `vi.mock('electron')` is needed — a fake instance is enough.
 */
function createFakeIpcRenderer() {
  const fake = {
    on: vi.fn(),
    once: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
    send: vi.fn(),
    invoke: vi.fn((_channel: string, ..._args: any[]) => Promise.resolve<any>(null)),
    sendSync: vi.fn(),
    postMessage: vi.fn(),
    sendTo: vi.fn(),
    sendToHost: vi.fn(),
  }

  return fake as typeof fake & IpcRenderer
}

/**
 * Stub `nodeIntegration`'s `window.require('electron')` escape hatch.
 * `afterEach` deletes the own property so tests never leak into each other.
 */
function stubWindowRequire(api: Record<string, unknown>) {
  (window as any).require = vi.fn(() => api)
}

afterEach(() => {
  delete (window as any).require
})

describe('useIpcRendererOn', () => {
  it('registers on mount and removes the same listener identity on unmount', async () => {
    const fake = createFakeIpcRenderer()
    const listener = vi.fn((_event: IpcRendererEvent, ..._args: any[]) => {})

    const { unmount } = await renderHook(() => useIpcRendererOn(fake, 'custom-event', listener))

    expect(fake.on).toHaveBeenCalledTimes(1)
    expect(fake.on).toHaveBeenCalledWith('custom-event', listener)
    expect(fake.removeListener).not.toHaveBeenCalled()

    await unmount()

    expect(fake.removeListener).toHaveBeenCalledTimes(1)
    expect(fake.removeListener).toHaveBeenCalledWith('custom-event', listener)
  })

  it('re-registers when the channel changes', async () => {
    const fake = createFakeIpcRenderer()
    const listener = vi.fn()

    const { rerender } = await renderHook(
      (props?: { channel?: string }) => useIpcRendererOn(fake, props!.channel!, listener),
      { initialProps: { channel: 'first' } },
    )

    await rerender({ channel: 'second' })

    expect(fake.on).toHaveBeenCalledWith('first', listener)
    expect(fake.on).toHaveBeenCalledWith('second', listener)
    expect(fake.removeListener).toHaveBeenCalledWith('first', listener)
  })

  it('returns the resolved instance and auto-resolves via window.require', async () => {
    const explicit = createFakeIpcRenderer()
    const listener = vi.fn()

    const { result } = await renderHook(() => useIpcRendererOn(explicit, 'custom-event', listener))
    expect(result.current).toBe(explicit)

    const auto = createFakeIpcRenderer()
    stubWindowRequire({ ipcRenderer: auto })

    const autoHook = await renderHook(() => useIpcRendererOn('custom-event', listener))
    expect(autoHook.result.current).toBe(auto)
    expect(auto.on).toHaveBeenCalledWith('custom-event', listener)
  })

  it('throws the upstream message when no instance is available', () => {
    expect(() => useIpcRendererOn('custom-event', vi.fn())).toThrow('please provide IpcRenderer module or enable nodeIntegration')
  })
})
