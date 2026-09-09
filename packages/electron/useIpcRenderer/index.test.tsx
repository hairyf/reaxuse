import type { IpcRenderer } from 'electron'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useIpcRenderer } from '../useIpcRenderer'

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

describe('useIpcRenderer', () => {
  it('on() registers immediately and auto-removes every tracked listener on unmount', async () => {
    const fake = createFakeIpcRenderer()
    const first = vi.fn()
    const second = vi.fn()

    const { result, act, unmount } = await renderHook(() => useIpcRenderer(fake))

    await act(() => {
      result.current.on('channel-one', first)
      result.current.on('channel-two', second)
    })

    expect(fake.on).toHaveBeenNthCalledWith(1, 'channel-one', first)
    expect(fake.on).toHaveBeenNthCalledWith(2, 'channel-two', second)

    await unmount()

    expect(fake.removeListener).toHaveBeenCalledWith('channel-one', first)
    expect(fake.removeListener).toHaveBeenCalledWith('channel-two', second)
    expect(fake.removeListener).toHaveBeenCalledTimes(2)
  })

  it('on() returns the ipcRenderer instance (chainable)', async () => {
    const fake = createFakeIpcRenderer()
    const { result, act } = await renderHook(() => useIpcRenderer(fake))

    let returned: IpcRenderer | undefined
    await act(() => {
      returned = result.current.on('custom-event', vi.fn())
    })

    expect(returned).toBe(fake)
  })

  it('keeps tracked listeners on the instance they were registered with across a swap, removed only on unmount', async () => {
    const first = createFakeIpcRenderer()
    const second = createFakeIpcRenderer()
    const listener = vi.fn()

    const { result, act, rerender, unmount } = await renderHook(
      (props?: { ipc?: IpcRenderer }) => useIpcRenderer(props?.ipc),
      { initialProps: { ipc: first } },
    )

    await act(() => {
      result.current.on('custom-event', listener)
    })
    expect(first.on).toHaveBeenCalledWith('custom-event', listener)

    await rerender({ ipc: second })

    // an instance swap neither drops nor re-registers the listener (upstream
    // scope-dispose semantics) — it stays on the instance it was registered with
    expect(first.removeListener).not.toHaveBeenCalled()
    expect(second.on).not.toHaveBeenCalled()

    await unmount()

    expect(first.removeListener).toHaveBeenCalledWith('custom-event', listener)
    expect(second.removeListener).not.toHaveBeenCalled()
  })

  it('delegates send/postMessage/sendTo/sendToHost with the right arguments', async () => {
    const fake = createFakeIpcRenderer()
    const { result, act } = await renderHook(() => useIpcRenderer(fake))

    await act(() => {
      result.current.send('send-channel', 'a', 1)
      result.current.postMessage('post-channel', { hello: 'world' })
      result.current.sendTo(42, 'send-to-channel', 'payload')
      result.current.sendToHost('host-channel', 'payload')
    })

    expect(fake.send).toHaveBeenCalledWith('send-channel', 'a', 1)
    expect(fake.postMessage).toHaveBeenCalledWith('post-channel', { hello: 'world' })
    expect(fake.sendTo).toHaveBeenCalledWith(42, 'send-to-channel', 'payload')
    expect(fake.sendToHost).toHaveBeenCalledWith('host-channel', 'payload')
  })

  it('delegates once/removeListener/removeAllListeners', async () => {
    const fake = createFakeIpcRenderer()
    const listener = vi.fn()
    const { result, act } = await renderHook(() => useIpcRenderer(fake))

    await act(() => {
      result.current.once('once-channel', listener)
      result.current.removeListener('once-channel', listener)
      result.current.removeAllListeners('once-channel')
    })

    expect(fake.once).toHaveBeenCalledWith('once-channel', listener)
    expect(fake.removeListener).toHaveBeenCalledWith('once-channel', listener)
    expect(fake.removeAllListeners).toHaveBeenCalledWith('once-channel')
  })

  it('invoke returns the raw promise and sendSync the raw value', async () => {
    const fake = createFakeIpcRenderer()
    fake.invoke.mockResolvedValue({ msg: 'pong' })
    fake.sendSync.mockReturnValue('sync-pong')

    const { result } = await renderHook(() => useIpcRenderer(fake))

    await expect(result.current.invoke<{ msg: string }>('custom-channel', 'ping')).resolves.toEqual({ msg: 'pong' })
    expect(result.current.sendSync<string>('sync-channel', 'ping')).toBe('sync-pong')
    expect(fake.invoke).toHaveBeenCalledWith('custom-channel', 'ping')
    expect(fake.sendSync).toHaveBeenCalledWith('sync-channel', 'ping')
  })

  it('resolves the instance from window.require when none is given', async () => {
    const fake = createFakeIpcRenderer()
    stubWindowRequire({ ipcRenderer: fake })

    const { result } = await renderHook(() => useIpcRenderer())

    expect(result.current.send).toBe(fake.send)
  })

  it('throws the upstream message when no instance is available', () => {
    expect(() => useIpcRenderer()).toThrow('provide IpcRenderer module or enable nodeIntegration')
  })
})
