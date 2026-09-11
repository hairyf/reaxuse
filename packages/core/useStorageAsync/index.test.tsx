import type { StorageLikeAsync } from '../useStorageAsync'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useStorageAsync } from '../useStorageAsync'

const KEY = 'custom-key'
const KEY2 = 'custom-key2'
const asyncDelay = 10
const localStorage = globalThis.localStorage

// mirrors the upstream tests' async stub storage — every operation resolves
// after `asyncDelay`, so the load is genuinely asynchronous
class AsyncStubStorage implements StorageLikeAsync {
  getItem(key: string) {
    return new Promise<string | null>((resolve) => {
      setTimeout(() => {
        resolve(localStorage.getItem(key))
      }, asyncDelay)
    })
  }

  removeItem(key: string) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        localStorage.removeItem(key)
        resolve()
      }, asyncDelay)
    })
  }

  setItem(key: string, value: string) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        localStorage.setItem(key, value)
        resolve()
      }, asyncDelay)
    })
  }
}

/**
 * Storage whose reads stay pending until the test calls `release()`. A
 * `setTimeout`-based delay can elapse inside `renderHook`'s `act` — which costs
 * tens of milliseconds in WebKit but about one millisecond in chromium — and
 * the "value starts as the default" assertions depend on that read still being
 * in flight.
 */
function createGatedStorage(): { storage: StorageLikeAsync, release: () => void } {
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  const storage: StorageLikeAsync = {
    getItem: async (key) => {
      await gate
      return localStorage.getItem(key)
    },
    setItem: async (key, value) => {
      localStorage.setItem(key, value)
    },
    removeItem: async (key) => {
      localStorage.removeItem(key)
    },
  }
  return { storage, release }
}

describe('useStorageAsync', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('onReady', async () => {
    localStorage.setItem(KEY, 'CurrentValue')

    const { storage, release } = createGatedStorage()

    let loaded: string | undefined
    const { result } = await renderHook(() => useStorageAsync(KEY, '', storage, {
      onReady(value) {
        loaded = value
      },
    }))

    // the value starts as the default until the async storage is ready
    expect(result.current[0]).toBe('')
    expect(loaded).toBeUndefined()

    release()

    await vi.waitFor(() => {
      expect(loaded).toBe('CurrentValue')
    })
    expect(result.current[0]).toBe('CurrentValue')
  })

  it('onReadyByPromise', async () => {
    localStorage.setItem(KEY2, 'AnotherValue')

    const { storage, release } = createGatedStorage()

    const { result } = await renderHook(() => useStorageAsync(KEY2, '', storage))

    // the value starts as the default until the async storage is ready
    expect(result.current[0]).toBe('')

    release()

    // upstream's returned ref doubles as a Promise (`await useStorageAsync`);
    // in React the tuple cannot be awaited, so the equivalent is waiting for
    // the loaded value to land in state
    await vi.waitFor(() => {
      expect(result.current[0]).toBe('AnotherValue')
    })
  })

  it('setValue persists values to the async storage', async () => {
    let ready = false
    const { result, act } = await renderHook(() => useStorageAsync(KEY, 'a', new AsyncStubStorage(), {
      onReady() {
        ready = true
      },
    }))

    // wait for the initial load to settle so it cannot race the write
    await vi.waitFor(() => {
      expect(ready).toBe(true)
    })

    await act(() => {
      result.current[1]('b')
    })
    expect(result.current[0]).toBe('b')

    await vi.waitFor(() => {
      expect(localStorage.getItem(KEY)).toBe('b')
    })
  })

  it('setValue(null) removes the entry from the async storage', async () => {
    localStorage.setItem(KEY, 'CurrentValue')

    let ready = false
    const { result, act } = await renderHook(() => useStorageAsync(KEY, 'a', new AsyncStubStorage(), {
      onReady() {
        ready = true
      },
    }))

    await vi.waitFor(() => {
      expect(ready).toBe(true)
    })
    expect(result.current[0]).toBe('CurrentValue')

    await act(() => {
      result.current[1](null)
    })
    expect(result.current[0]).toBeNull()

    await vi.waitFor(() => {
      expect(localStorage.getItem(KEY)).toBeNull()
    })
  })

  it('writeDefaults seeds the empty async storage on mount', async () => {
    const { result } = await renderHook(() => useStorageAsync(KEY, 'a', new AsyncStubStorage()))

    await vi.waitFor(() => {
      expect(localStorage.getItem(KEY)).toBe('a')
    })
    expect(result.current[0]).toBe('a')
  })

  it('calls onError when the async read fails', async () => {
    const onError = vi.fn()
    const failing: StorageLikeAsync = {
      getItem: async () => {
        throw new Error('read failed')
      },
      setItem: async () => {},
      removeItem: async () => {},
    }

    const { result } = await renderHook(() => useStorageAsync(KEY, 'a', failing, { onError }))

    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith(new Error('read failed'))
    })
    // the failed read leaves the default value untouched
    expect(result.current[0]).toBe('a')
  })

  it('re-reads on storage events for the matching key', async () => {
    let ready = false
    const { result, act } = await renderHook(() => useStorageAsync(KEY, '', undefined, {
      onReady() {
        ready = true
      },
    }))

    await vi.waitFor(() => {
      expect(ready).toBe(true)
    })

    localStorage.setItem(KEY, 'NewValue')
    await act(() => {
      window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: KEY, newValue: 'NewValue' }))
    })

    await vi.waitFor(() => {
      expect(result.current[0]).toBe('NewValue')
    })
  })

  it('re-reads on a matching-key event even for a different storage area (no storageArea guard)', async () => {
    let ready = false
    const { result, act } = await renderHook(() => useStorageAsync(KEY, '', new AsyncStubStorage(), {
      onReady() {
        ready = true
      },
    }))

    await vi.waitFor(() => {
      expect(ready).toBe(true)
    })

    // the event's storageArea is the real localStorage, NOT the custom async
    // backend — the matching key must still trigger a re-read (upstream has
    // no storageArea guard, and a custom backend never appears as an event's
    // storageArea)
    localStorage.setItem(KEY, 'FromOtherTab')
    await act(() => {
      window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: KEY, newValue: 'FromOtherTab' }))
    })

    await vi.waitFor(() => {
      expect(result.current[0]).toBe('FromOtherTab')
    })
  })

  it('setValue always performs setItem, even when the serialized value is unchanged', async () => {
    const storage = new AsyncStubStorage()
    const setItemSpy = vi.spyOn(storage, 'setItem')
    let ready = false
    const { result, act } = await renderHook(() => useStorageAsync(KEY, 'a', storage, {
      onReady() {
        ready = true
      },
    }))

    await vi.waitFor(() => {
      expect(ready).toBe(true)
    })
    // drop the mount-time writeDefaults write
    setItemSpy.mockClear()

    await act(() => {
      result.current[1]('a') // serialized 'a' === stored 'a' — must still write
    })

    await vi.waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(KEY, 'a')
    })
  })
})
