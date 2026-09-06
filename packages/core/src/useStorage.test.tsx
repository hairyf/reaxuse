import type { StorageEventLike, StorageLike } from './useStorage'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { customStorageEventName, StorageSerializers, useStorage } from './useStorage'

const KEY = 'test-storage-key'
const ANOTHER_KEY = 'another-key'

// Map-backed custom backend, mirroring the upstream tests' storage mock —
// not a real `Storage` instance, so it exercises the `StorageLike` +
// custom-event path
const storageState = new Map<string, string | null>()
const customStorage: StorageLike = {
  getItem: key => storageState.get(key) ?? null,
  setItem: (key, value) => {
    storageState.set(key, value)
  },
  removeItem: (key) => {
    storageState.delete(key)
  },
}

describe('useStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    storageState.clear()
  })

  afterEach(() => {
    localStorage.clear()
    storageState.clear()
  })

  it('exports the module and serializer registry', () => {
    expect(useStorage).toBeDefined()
    expect(StorageSerializers).toBeDefined()
    expect(StorageSerializers.boolean.read('true')).toBe(true)
    expect(StorageSerializers.number.read('1.5')).toBe(1.5)
    expect(StorageSerializers.map.write(new Map([[1, 'a']]))).toBe('[[1,"a"]]')
    expect(StorageSerializers.date.read('2000-01-01T00:00:00.000Z')).toEqual(new Date('2000-01-01T00:00:00.000Z'))
  })

  it('persists the initial value to empty storage on mount', async () => {
    const { result } = await renderHook(() => useStorage(KEY, 'a'))

    expect(result.current[0]).toBe('a')
    expect(localStorage.getItem(KEY)).toBe('a')
  })

  it('uses the stored value when present', async () => {
    localStorage.setItem(KEY, 'b')

    const { result } = await renderHook(() => useStorage(KEY, 'a'))

    expect(result.current[0]).toBe('b')
    expect(localStorage.getItem(KEY)).toBe('b')
  })

  it('reads pre-seeded values across types', async () => {
    localStorage.setItem(KEY, 'true')
    const booleanHook = await renderHook(() => useStorage(KEY, false))
    expect(booleanHook.result.current[0]).toBe(true)

    localStorage.setItem(KEY, '0')
    const numberHook = await renderHook(() => useStorage(KEY, 1))
    expect(numberHook.result.current[0]).toBe(0)

    localStorage.setItem(KEY, JSON.stringify({}))
    const objectHook = await renderHook(() => useStorage(KEY, { a: 1 }))
    expect(objectHook.result.current[0]).toEqual({})

    localStorage.setItem(KEY, '')
    const emptyHook = await renderHook(() => useStorage<string | null>(KEY, null))
    expect(emptyHook.result.current[0]).toBe('')

    localStorage.setItem(KEY, JSON.stringify([]))
    const mapHook = await renderHook(() => useStorage(KEY, new Map([[1, 2]])))
    expect(mapHook.result.current[0]).toEqual(new Map())

    localStorage.setItem(KEY, JSON.stringify([]))
    const setHook = await renderHook(() => useStorage(KEY, new Set([1, 2])))
    expect(setHook.result.current[0]).toEqual(new Set())
  })

  it('starts null with a null initial value on empty storage', async () => {
    const { result } = await renderHook(() => useStorage<string | null>(KEY, null))

    expect(result.current[0]).toBeNull()
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('reads a raw string with a null initial value', async () => {
    localStorage.setItem(KEY, 'null')

    const { result } = await renderHook(() => useStorage<string | null>(KEY, null))

    expect(result.current[0]).toBe('null')
    expect(localStorage.getItem(KEY)).toBe('null')
  })

  it('setValue persists string values', async () => {
    const { result, act } = await renderHook(() => useStorage(KEY, 'a'))

    await act(() => {
      result.current[1]('b')
    })
    expect(result.current[0]).toBe('b')
    expect(localStorage.getItem(KEY)).toBe('b')
  })

  it('setValue persists number values', async () => {
    localStorage.setItem(KEY, '0')

    const { result, act } = await renderHook(() => useStorage(KEY, 1))
    expect(result.current[0]).toBe(0)

    await act(() => {
      result.current[1](2)
    })
    expect(localStorage.getItem(KEY)).toBe('2')

    await act(() => {
      result.current[1](-1)
    })
    expect(localStorage.getItem(KEY)).toBe('-1')

    await act(() => {
      result.current[1](2.3)
    })
    expect(localStorage.getItem(KEY)).toBe('2.3')
  })

  it('setValue persists boolean values', async () => {
    const { result, act } = await renderHook(() => useStorage(KEY, true))

    expect(result.current[0]).toBe(true)
    expect(localStorage.getItem(KEY)).toBe('true')

    await act(() => {
      result.current[1](false)
    })
    expect(result.current[0]).toBe(false)
    expect(localStorage.getItem(KEY)).toBe('false')
  })

  it('setValue persists objects as JSON', async () => {
    const { result, act } = await renderHook(() => useStorage(KEY, { name: 'a', data: 123 }))

    expect(result.current[0]).toEqual({ name: 'a', data: 123 })
    expect(localStorage.getItem(KEY)).toBe('{"name":"a","data":123}')

    await act(() => {
      result.current[1]({ name: 'b', data: 321 })
    })
    expect(result.current[0]).toEqual({ name: 'b', data: 321 })
    expect(localStorage.getItem(KEY)).toBe('{"name":"b","data":321}')
  })

  it('setValue supports a function updater', async () => {
    const { result, act } = await renderHook(() => useStorage(KEY, 1))

    await act(() => {
      result.current[1](prev => (prev ?? 0) + 1)
    })
    expect(result.current[0]).toBe(2)
    expect(localStorage.getItem(KEY)).toBe('2')
  })

  it('supports a lazy function initial value', async () => {
    const { result } = await renderHook(() => useStorage(KEY, () => ({ lazy: true })))

    expect(result.current[0]).toEqual({ lazy: true })
    expect(localStorage.getItem(KEY)).toBe('{"lazy":true}')
  })

  it.each([
    1,
    'a',
    [1, 2],
    { a: 1 },
    new Map([[1, 2]]),
    new Set([1, 2]),
  ])('works in conjunction with lazy and plain defaults', async (value) => {
    const typed = value as any

    const lazy = await renderHook(() => useStorage(KEY, () => typed))
    expect(lazy.result.current[0]).toEqual(typed)
    await lazy.unmount()

    localStorage.removeItem(KEY)
    const plain = await renderHook(() => useStorage(KEY, typed))
    expect(plain.result.current[0]).toEqual(typed)
    await plain.unmount()
  })

  it('setValue(null) removes the entry and restores the initial value', async () => {
    const { result, act } = await renderHook(() => useStorage(KEY, 'a'))

    await act(() => {
      result.current[1]('b')
    })
    expect(localStorage.getItem(KEY)).toBe('b')

    await act(() => {
      result.current[1](null)
    })
    expect(localStorage.getItem(KEY)).toBeNull()
    // upstream: the self storage-event echo restores `rawInit` after removal
    expect(result.current[0]).toBe('a')
  })

  it('setValue(null) with a null initial value removes and stays null', async () => {
    const { result, act } = await renderHook(() => useStorage<string | null>(KEY, null))

    await act(() => {
      result.current[1]('random')
    })
    expect(result.current[0]).toBe('random')
    expect(localStorage.getItem(KEY)).toBe('random')

    await act(() => {
      result.current[1](null)
    })
    expect(result.current[0]).toBeNull()
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('persists Date values via ISO strings', async () => {
    const { result, act } = await renderHook(() => useStorage(KEY, new Date('2000-01-02T00:00:00.000Z')))

    expect(localStorage.getItem(KEY)).toBe('2000-01-02T00:00:00.000Z')
    expect(result.current[0]).toEqual(new Date('2000-01-02T00:00:00.000Z'))

    await act(() => {
      result.current[1](new Date('2000-01-03T00:00:00.000Z'))
    })
    expect(localStorage.getItem(KEY)).toBe('2000-01-03T00:00:00.000Z')
  })

  it('persists Map values', async () => {
    const { result, act } = await renderHook(() => useStorage(KEY, new Map<number, string | number>([[1, 'a'], [2, 2]])))

    expect(localStorage.getItem(KEY)).toBe('[[1,"a"],[2,2]]')
    expect(result.current[0]).toEqual(new Map<number, string | number>([[1, 'a'], [2, 2]]))

    await act(() => {
      result.current[1](new Map<number, string | number>([[1, 'c'], [2, 3]]))
    })
    expect(localStorage.getItem(KEY)).toBe('[[1,"c"],[2,3]]')
  })

  it('persists Set values', async () => {
    const { result, act } = await renderHook(() => useStorage(KEY, new Set<string | number>([1, '2'])))

    expect(localStorage.getItem(KEY)).toBe('[1,"2"]')
    expect(result.current[0]).toEqual(new Set<string | number>([1, '2']))

    await act(() => {
      result.current[1](new Set<string | number>([1, '2', '1']))
    })
    expect(localStorage.getItem(KEY)).toBe('[1,"2","1"]')
  })

  it('writeDefaults: false leaves empty storage untouched', async () => {
    const { result } = await renderHook(() => useStorage(KEY, 'a', undefined, { writeDefaults: false }))

    expect(result.current[0]).toBe('a')
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('mergeDefaults merges the stored value with the default', async () => {
    // basic
    localStorage.setItem(KEY, '0')
    const basic = await renderHook(() => useStorage(KEY, 1, undefined, { mergeDefaults: true }))
    expect(basic.result.current[0]).toBe(0)
    await basic.unmount()

    // object
    localStorage.setItem(KEY, JSON.stringify({ a: 1 }))
    const object = await renderHook(() => useStorage(KEY, { a: 2, b: 3 }, undefined, { mergeDefaults: true }))
    expect(object.result.current[0]).toEqual({ a: 1, b: 3 })
    await object.unmount()

    // array
    localStorage.setItem(KEY, JSON.stringify([1]))
    const array = await renderHook(() => useStorage(KEY, [2], undefined, { mergeDefaults: true }))
    expect(array.result.current[0]).toEqual([1])
    await array.unmount()

    // custom function
    localStorage.setItem(KEY, JSON.stringify([{ a: 1 }]))
    const custom = await renderHook(() => useStorage(KEY, [{ a: 3 }], undefined, {
      mergeDefaults: (value, initial) => [...initial, ...value],
    }))
    expect(custom.result.current[0]).toEqual([{ a: 3 }, { a: 1 }])
    await custom.unmount()

    // custom function 2
    localStorage.setItem(KEY, '1')
    const sum = await renderHook(() => useStorage(KEY, 2, undefined, { mergeDefaults: (value, initial) => value + initial }))
    expect(sum.result.current[0]).toBe(3)
  })

  it('accepts StorageSerializers entries as a custom serializer', async () => {
    localStorage.setItem(KEY, JSON.stringify({ foo: 'bar' }))

    const { result } = await renderHook(() => useStorage(KEY, { foo: 'baz' }, undefined, { serializer: StorageSerializers.object }))

    expect(result.current[0]).toStrictEqual({ foo: 'bar' })
  })

  it('supports a custom serializer', async () => {
    const { result, act } = await renderHook(() => useStorage<number | object>(KEY, 0, undefined, {
      serializer: { read: JSON.parse, write: JSON.stringify },
    }))

    expect(result.current[0]).toBe(0)
    expect(localStorage.getItem(KEY)).toBe('0')

    await act(() => {
      result.current[1]({ name: 'a' })
    })
    expect(result.current[0]).toEqual({ name: 'a' })
    expect(localStorage.getItem(KEY)).toBe('{"name":"a"}')

    await act(() => {
      result.current[1](null)
    })
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('re-reads storage when the key changes', async () => {
    localStorage.setItem(ANOTHER_KEY, '1')

    const { result, rerender, act } = await renderHook(
      ({ key }: { key: string } = { key: KEY }) => useStorage(key, '0'),
      { initialProps: { key: KEY } },
    )

    await act(() => {
      result.current[1]('2')
    })
    expect(localStorage.getItem(KEY)).toBe('2')

    await rerender({ key: ANOTHER_KEY })
    expect(result.current[0]).toBe('1')
    expect(localStorage.getItem(KEY)).toBe('2')

    await act(() => {
      result.current[1]('3')
    })
    expect(localStorage.getItem(ANOTHER_KEY)).toBe('3')
  })

  it('listens for storage events under the new key after a key change', async () => {
    const { result, rerender, act } = await renderHook(
      ({ key }: { key: string } = { key: KEY }) => useStorage(key, 0),
      { initialProps: { key: KEY } },
    )

    await rerender({ key: ANOTHER_KEY })

    await act(() => {
      window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: ANOTHER_KEY, newValue: '1' }))
    })
    expect(result.current[0]).toBe(1)

    await act(() => {
      window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: KEY, newValue: '2' }))
    })
    expect(result.current[0]).toBe(1)
  })

  it('syncs two hooks sharing the same key within the same document', async () => {
    const first = await renderHook(() => useStorage(KEY, 0))
    const second = await renderHook(() => useStorage(KEY, 0))

    expect(first.result.current[0]).toBe(0)
    expect(second.result.current[0]).toBe(0)

    await first.act(() => {
      first.result.current[1](1)
    })

    expect(first.result.current[0]).toBe(1)
    expect(second.result.current[0]).toBe(1)
    expect(localStorage.getItem(KEY)).toBe('1')
  })

  it('ignores storage events for other keys and other storage areas', async () => {
    const { result, act } = await renderHook(() => useStorage(KEY, 0))

    await act(() => {
      window.dispatchEvent(new StorageEvent('storage'))
      window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: 'unknown', newValue: '1' }))
      window.dispatchEvent(new StorageEvent('storage', { storageArea: sessionStorage, key: KEY, newValue: '1' }))
    })
    expect(result.current[0]).toBe(0)

    await act(() => {
      window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: KEY, newValue: '1' }))
    })
    expect(result.current[0]).toBe(1)
  })

  it('resets to the initial value when a matching clear event arrives', async () => {
    const { result, act } = await renderHook(() => useStorage(KEY, 0))

    await act(() => {
      result.current[1](5)
    })
    expect(result.current[0]).toBe(5)

    await act(() => {
      window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage }))
    })
    expect(result.current[0]).toBe(0)
  })

  it('stops listening to storage events after unmount', async () => {
    const { result, unmount, act } = await renderHook(() => useStorage(KEY, 0))
    await unmount()

    localStorage.setItem(KEY, '9')
    await act(() => {
      window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: KEY, newValue: '9' }))
    })
    expect(result.current[0]).toBe(0)
  })

  it('syncs two hooks on a custom storage backend through the custom event', async () => {
    const events: CustomEvent<StorageEventLike>[] = []
    const listener = (event: Event): void => {
      events.push(event as CustomEvent<StorageEventLike>)
    }
    window.addEventListener(customStorageEventName, listener)

    const first = await renderHook(() => useStorage(KEY, 0, customStorage))
    const second = await renderHook(() => useStorage(KEY, 0, customStorage))

    expect(first.result.current[0]).toBe(0)
    expect(second.result.current[0]).toBe(0)

    await first.act(() => {
      first.result.current[1](1)
    })

    expect(first.result.current[0]).toBe(1)
    expect(second.result.current[0]).toBe(1)
    expect(storageState.get(KEY)).toBe('1')

    await first.act(() => {
      first.result.current[1](null)
    })

    expect(first.result.current[0]).toBe(0)
    expect(second.result.current[0]).toBe(0)
    expect(storageState.has(KEY)).toBe(false)

    expect(events).toHaveLength(2)
    expect(events[0].detail.key).toBe(KEY)
    expect(events[0].detail.oldValue).toBe('0')
    expect(events[0].detail.newValue).toBe('1')
    expect(events[0].detail.storageArea).toBe(customStorage)
    expect(events[1].detail.key).toBe(KEY)
    expect(events[1].detail.oldValue).toBe('1')
    expect(events[1].detail.newValue).toBeNull()

    window.removeEventListener(customStorageEventName, listener)
  })

  it('reports write and read errors through onError', async () => {
    const onError = vi.fn()
    const failingStorage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('write item error')
      },
      removeItem: () => {},
    }

    const { result, act } = await renderHook(() => useStorage(KEY, 0, failingStorage, { onError }))

    // the mount read fails while writing the default value
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(new Error('write item error'))
    expect(result.current[0]).toBe(0)

    await act(() => {
      result.current[1](1)
    })
    expect(onError).toHaveBeenCalledTimes(2)
    // the state still updates even though the write failed
    expect(result.current[0]).toBe(1)
  })

  it('falls back to in-memory state when no storage is available', async () => {
    const { result, act } = await renderHook(() => useStorage(KEY, 'a', undefined, { window: {} as Window }))

    expect(result.current[0]).toBe('a')

    await act(() => {
      result.current[1]('b')
    })
    expect(result.current[0]).toBe('b')
    expect(localStorage.getItem(KEY)).toBeNull()
  })
})
