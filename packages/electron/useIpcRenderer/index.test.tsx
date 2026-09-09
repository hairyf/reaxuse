import type { IpcRenderer, IpcRendererEvent } from 'electron'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useIpcRenderer } from '../useIpcRenderer'
import { useIpcRendererInvoke } from '../useIpcRendererInvoke'
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
