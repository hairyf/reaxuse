import type { IpcRenderer } from 'electron'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useIpcRendererInvoke } from '../useIpcRendererInvoke'

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

describe('useIpcRendererInvoke', () => {
  it('invokes on mount and re-renders with the response (explicit instance)', async () => {
    const fake = createFakeIpcRenderer()
    fake.invoke.mockResolvedValue('hello')

    const { result } = await renderHook(() => useIpcRendererInvoke<string>(fake, 'custom-channel', 'some data'))

    await expect.poll(() => result.current).toBe('hello')
    expect(fake.invoke).toHaveBeenCalledWith('custom-channel', 'some data')
  })

  it('resolves the instance from window.require when none is given', async () => {
    const fake = createFakeIpcRenderer()
    fake.invoke.mockResolvedValue({ msg: 'ok' })
    stubWindowRequire({ ipcRenderer: fake })

    const { result } = await renderHook(() => useIpcRendererInvoke<{ msg: string }>('custom-channel', 'some data'))

    await expect.poll(() => result.current).toEqual({ msg: 'ok' })
    expect(fake.invoke).toHaveBeenCalledWith('custom-channel', 'some data')
  })

  it('re-invokes when the channel changes', async () => {
    const fake = createFakeIpcRenderer()
    fake.invoke.mockImplementation((channel: string) => Promise.resolve(`response:${channel}`))

    const { result, rerender } = await renderHook(
      (props?: { channel?: string }) => useIpcRendererInvoke<string>(fake, props!.channel!),
      { initialProps: { channel: 'first' } },
    )

    await expect.poll(() => result.current).toBe('response:first')

    await rerender({ channel: 'second' })

    await expect.poll(() => result.current).toBe('response:second')
    expect(fake.invoke).toHaveBeenCalledWith('first')
    expect(fake.invoke).toHaveBeenCalledWith('second')
  })

  it('ignores a late resolution after unmount', async () => {
    const fake = createFakeIpcRenderer()
    let settle: (value: string) => void = () => {}
    fake.invoke.mockImplementation(() => new Promise<string>((resolve) => {
      settle = resolve
    }))

    const { result, unmount } = await renderHook(() => useIpcRendererInvoke<string>(fake, 'slow-channel'))
    expect(result.current).toBeNull()

    await unmount()
    settle('too late')
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(result.current).toBeNull()
  })

  it('throws the upstream message when no instance is available', () => {
    expect(() => useIpcRendererInvoke('custom-channel')).toThrow('please provide IpcRenderer module or enable nodeIntegration')
  })
})
