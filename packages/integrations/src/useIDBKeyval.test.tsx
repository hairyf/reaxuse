import type { UseIDBKeyvalSerializer } from './useIDBKeyval'
import { clear, get, set } from 'idb-keyval'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useIDBKeyval } from './useIDBKeyval'

// Mirrors upstream `index.test.ts` (read/write, defaults, serializer, errors)
// and `index.browser.test.ts` (cross-tab BroadcastChannel syncing). The store
// is cleared before and after every test so the keys stay deterministic.

const KEY = 'reaxuse-idb-keyval-1'
const KEY_2 = 'reaxuse-idb-keyval-2'
const KEY_3 = 'reaxuse-idb-keyval-3'
const KEY_4 = 'reaxuse-idb-keyval-4'
const CHANNEL_NAME = `vueuse-idb-${JSON.stringify(KEY)}`

/** Serializer mirroring upstream: `'foo'` ⇄ `1`, anything else ⇄ `0`. */
const fooBarSerializer: UseIDBKeyvalSerializer<string> = {
  read: (raw: unknown) => (raw === 1 ? 'foo' : 'bar'),
  write: (value: string) => (value === 'foo' ? 1 : 0),
}

/**
 * Poll an async store read until `matcher` passes — `expect.poll()` cannot be
 * combined with `.resolves`, so the read and the assertion are polled together.
 */
async function expectStored<T>(key: IDBValidKey, matcher: (received: T | undefined) => void): Promise<void> {
  await expect.poll(() => {
    return get<T>(key).then((value) => {
      try {
        matcher(value)
        return true
      }
      catch {
        return false
      }
    })
  }).toBe(true)
}

beforeEach(async () => {
  await clear()
})

afterEach(async () => {
  await clear()
  vi.restoreAllMocks()
})

describe('useIDBKeyval', () => {
  it('should be defined', () => {
    expect(useIDBKeyval).toBeDefined()
  })

  it('reads the initial value and writes it when the key is missing (writeDefaults)', async () => {
    const { result } = await renderHook(() => useIDBKeyval(KEY, { count: 0 }))

    // the initial value is available synchronously, before the async read
    expect(result.current[0]).toEqual({ count: 0 })

    await expect.poll(() => result.current[2].isFinished).toBe(true)
    await expectStored(KEY, (stored: { count: number } | undefined) => expect(stored).toEqual({ count: 0 }))
  })

  it('reads an existing value from the store', async () => {
    await set(KEY, { count: 42 })

    const { result } = await renderHook(() => useIDBKeyval(KEY, { count: 0 }))

    await expect.poll(() => result.current[0]).toEqual({ count: 42 })
    await expect.poll(() => result.current[2].isFinished).toBe(true)
    // the stored value wins — the default must not overwrite it
    await expectStored(KEY, (stored: { count: number } | undefined) => expect(stored).toEqual({ count: 42 }))
  })

  it('resolves a ref-like initial value (RefOrValue)', async () => {
    const initial = { current: { count: 7 } }

    const { result } = await renderHook(() => useIDBKeyval(KEY, initial))

    expect(result.current[0]).toEqual({ count: 7 })
    await expectStored(KEY, (stored: { count: number } | undefined) => expect(stored).toEqual({ count: 7 }))
  })

  it('writes on setData and round-trips a fresh mount', async () => {
    const first = await renderHook(() => useIDBKeyval<string[]>(KEY_2, ['foo', 'bar']))
    await expect.poll(() => first.result.current[2].isFinished).toBe(true)

    await first.act(async () => {
      await first.result.current[1](['foo', 'bar', 'woo'])
    })

    expect(first.result.current[0]).toEqual(['foo', 'bar', 'woo'])
    await expectStored(KEY_2, (stored: string[] | undefined) => expect(stored).toEqual(['foo', 'bar', 'woo']))

    // a second mount reads the persisted value back
    const second = await renderHook(() => useIDBKeyval<string[]>(KEY_2, ['foo', 'bar']))
    await expect.poll(() => second.result.current[0]).toEqual(['foo', 'bar', 'woo'])
  })

  it('does not auto-write on in-place mutation (no deep watcher — React contract)', async () => {
    const { result } = await renderHook(() => useIDBKeyval(KEY, { count: 0 }))
    await expect.poll(() => result.current[2].isFinished).toBe(true)

    // upstream's `deep: true` watcher would persist this; React has no deep
    // observation, so only `setData` writes
    result.current[0]!.count++

    await new Promise(resolve => setTimeout(resolve, 50))
    await expectStored(KEY, (stored: { count: number } | undefined) => expect(stored).toEqual({ count: 0 }))
  })

  it('deletes the key when setData(null) is called', async () => {
    const { result, act } = await renderHook(() => useIDBKeyval(KEY, 'hello'))
    await expect.poll(() => result.current[2].isFinished).toBe(true)

    await act(async () => {
      await result.current[1](null)
    })

    expect(result.current[0]).toBeNull()
    await expectStored(KEY, (stored: string | undefined) => expect(stored).toBeUndefined())
  })

  it('does not write the default when writeDefaults is false', async () => {
    const { result } = await renderHook(() => useIDBKeyval(KEY_4, 'test', { writeDefaults: false }))

    await expect.poll(() => result.current[2].isFinished).toBe(true)
    expect(result.current[0]).toBe('test')
    await expectStored(KEY_4, (stored: string | undefined) => expect(stored).toBeUndefined())
  })

  it('transitions isFinished false → true', async () => {
    const { result } = await renderHook(() => useIDBKeyval(KEY_4, 'test'))

    expect(result.current[2].isFinished).toBe(false)
    await expect.poll(() => result.current[2].isFinished).toBe(true)
  })

  it('reports isSupported for BroadcastChannel', async () => {
    const { result } = await renderHook(() => useIDBKeyval(KEY, 'initial'))

    expect(result.current[2].isSupported).toBe('BroadcastChannel' in window)
  })

  it('writes through a custom serializer', async () => {
    const { result } = await renderHook(() => useIDBKeyval(KEY_4, 'foo', { serializer: fooBarSerializer }))

    await expect.poll(() => result.current[2].isFinished).toBe(true)
    expect(result.current[0]).toBe('foo')
    await expectStored(KEY_4, (stored: number | undefined) => expect(stored).toBe(1))
  })

  it('reads an existing raw value through a custom serializer', async () => {
    await set(KEY_4, 0)

    const { result } = await renderHook(() => useIDBKeyval(KEY_4, 'foo', { serializer: fooBarSerializer }))

    await expect.poll(() => result.current[0]).toBe('bar')
    // the stored raw value is left untouched
    await expectStored(KEY_4, (stored: number | undefined) => expect(stored).toBe(0))
  })

  it('serializes through setData', async () => {
    const { result, act } = await renderHook(() => useIDBKeyval(KEY_4, 'foo', { serializer: fooBarSerializer }))
    await expect.poll(() => result.current[2].isFinished).toBe(true)

    await act(async () => {
      await result.current[1]('bar')
    })

    await expectStored(KEY_4, (stored: number | undefined) => expect(stored).toBe(0))
  })

  it('calls onError when the initial read throws', async () => {
    const onError = vi.fn()
    const serializer: UseIDBKeyvalSerializer<string> = {
      read: () => {
        throw new Error('read error')
      },
      write: (value: string) => value,
    }
    await set(KEY_3, 'hello')

    const { result } = await renderHook(() => useIDBKeyval(KEY_3, 'world', { serializer, onError }))

    await expect.poll(() => onError).toHaveBeenCalledTimes(1)
    await expect.poll(() => result.current[2].isFinished).toBe(true)
  })

  it('calls onError when a write fails and still updates the state', async () => {
    const onError = vi.fn()
    const serializer: UseIDBKeyvalSerializer<string> = {
      read: (raw: unknown) => raw as string,
      write: (value: string) => {
        // only the explicit `setData` write fails — the mount-time
        // `writeDefaults` write succeeds
        if (value === 'updated')
          throw new Error('write error')
        return value
      },
    }

    const { result, act } = await renderHook(() => useIDBKeyval(KEY, 'hello', { serializer, onError }))
    await expect.poll(() => result.current[2].isFinished).toBe(true)

    await act(async () => {
      await result.current[1]('updated')
    })

    await expect.poll(() => onError).toHaveBeenCalledTimes(1)
    expect(result.current[0]).toBe('updated')
    // the failed write leaves the previously persisted value in place
    await expectStored(KEY, (stored: string | undefined) => expect(stored).toBe('hello'))
  })

  it('defaults onError to console.error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const serializer: UseIDBKeyvalSerializer<string> = {
      read: () => {
        throw new Error('read error')
      },
      write: (value: string) => value,
    }
    await set(KEY_3, 'hello')

    await renderHook(() => useIDBKeyval(KEY_3, 'world', { serializer }))

    await expect.poll(() => errorSpy).toHaveBeenCalledTimes(1)
  })

  it('re-reads the store when the key changes', async () => {
    await set(KEY_2, 'second')

    const { result, rerender } = await renderHook(
      ({ key = KEY_3 }: { key?: string } = {}) => useIDBKeyval(key, 'initial'),
      { initialProps: { key: KEY_3 } },
    )
    await expect.poll(() => result.current[2].isFinished).toBe(true)
    await expect.poll(() => result.current[0]).toBe('initial')

    await rerender({ key: KEY_2 })

    await expect.poll(() => result.current[0]).toBe('second')
  })
})

describe('useIDBKeyval cross-tab syncing via BroadcastChannel', () => {
  it('broadcasts a set message when setData writes', async () => {
    const { result, act } = await renderHook(() => useIDBKeyval(KEY, 'initial'))
    await expect.poll(() => result.current[2].isFinished).toBe(true)

    const received: unknown[] = []
    const receiver = new BroadcastChannel(CHANNEL_NAME)
    receiver.addEventListener('message', (event: MessageEvent) => received.push(event.data))

    await act(async () => {
      await result.current[1]('updated')
    })

    await expect.poll(() => received).toContainEqual({ type: 'set', value: 'updated' })
    receiver.close()
  })

  it('broadcasts a delete message when setData(null) is called', async () => {
    const { result, act } = await renderHook(() => useIDBKeyval(KEY, 'initial'))
    await expect.poll(() => result.current[2].isFinished).toBe(true)

    const received: unknown[] = []
    const receiver = new BroadcastChannel(CHANNEL_NAME)
    receiver.addEventListener('message', (event: MessageEvent) => received.push(event.data))

    await act(async () => {
      await result.current[1](null)
    })

    await expect.poll(() => received).toContainEqual({ type: 'delete' })
    receiver.close()
  })

  it('applies a set message from another tab', async () => {
    const { result } = await renderHook(() => useIDBKeyval(KEY, 'initial'))
    await expect.poll(() => result.current[2].isFinished).toBe(true)

    const sender = new BroadcastChannel(CHANNEL_NAME)
    sender.postMessage({ type: 'set', value: 'from-other-tab' })

    await expect.poll(() => result.current[0]).toBe('from-other-tab')
    sender.close()
  })

  it('applies a set message through the custom serializer', async () => {
    const { result } = await renderHook(() => useIDBKeyval(KEY, 'foo', { serializer: fooBarSerializer }))
    await expect.poll(() => result.current[2].isFinished).toBe(true)

    const sender = new BroadcastChannel(CHANNEL_NAME)
    sender.postMessage({ type: 'set', value: 0 })

    await expect.poll(() => result.current[0]).toBe('bar')
    sender.close()
  })

  it('resets to the initial value on a delete message', async () => {
    const { result, act } = await renderHook(() => useIDBKeyval(KEY, 'initial'))
    await expect.poll(() => result.current[2].isFinished).toBe(true)

    await act(async () => {
      await result.current[1]('changed')
    })

    const sender = new BroadcastChannel(CHANNEL_NAME)
    sender.postMessage({ type: 'delete' })

    await expect.poll(() => result.current[0]).toBe('initial')
    sender.close()
  })

  it('does not write back to the store when receiving a set message', async () => {
    const { result } = await renderHook(() => useIDBKeyval(KEY, 'initial'))
    await expect.poll(() => result.current[2].isFinished).toBe(true)

    const sender = new BroadcastChannel(CHANNEL_NAME)
    sender.postMessage({ type: 'set', value: 'from-other-tab' })
    await expect.poll(() => result.current[0]).toBe('from-other-tab')

    // give any spurious write-back time to settle
    await new Promise(resolve => setTimeout(resolve, 50))
    await expectStored(KEY, (stored: string | undefined) => expect(stored).toBe('initial'))
    sender.close()
  })

  it('calls onError and keeps syncing when serializer.read throws on an incoming message', async () => {
    const onError = vi.fn()
    const serializer: UseIDBKeyvalSerializer<string> = {
      read: () => {
        throw new Error('read error')
      },
      write: (value: string) => value,
    }

    const { result, act } = await renderHook(() => useIDBKeyval(KEY, 'initial', { serializer, onError }))
    await expect.poll(() => result.current[2].isFinished).toBe(true)

    const sender = new BroadcastChannel(CHANNEL_NAME)
    sender.postMessage({ type: 'set', value: 'from-other-tab' })

    await expect.poll(() => onError).toHaveBeenCalledTimes(1)
    expect(result.current[0]).toBe('initial')

    // the listener must survive the error — a local write still goes through
    await act(async () => {
      await result.current[1]('local-update')
    })
    await expectStored(KEY, (stored: string | undefined) => expect(stored).toBe('local-update'))
    sender.close()
  })

  it('does not sync when listenToStorageChanges is false', async () => {
    const { result } = await renderHook(() => useIDBKeyval(KEY, 'initial', { listenToStorageChanges: false }))
    await expect.poll(() => result.current[2].isFinished).toBe(true)

    const sender = new BroadcastChannel(CHANNEL_NAME)
    sender.postMessage({ type: 'set', value: 'from-other-tab' })

    await new Promise(resolve => setTimeout(resolve, 100))
    expect(result.current[0]).toBe('initial')
    sender.close()
  })

  it('closes the channel on unmount', async () => {
    const closeSpy = vi.spyOn(BroadcastChannel.prototype, 'close')

    const { result, unmount } = await renderHook(() => useIDBKeyval(KEY, 'initial'))
    await expect.poll(() => result.current[2].isFinished).toBe(true)

    unmount()

    await expect.poll(() => closeSpy).toHaveBeenCalled()
  })
})
