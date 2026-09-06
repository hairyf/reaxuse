import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useLocalStorage } from './useLocalStorage'

const KEY = 'test-local-key'
const ANOTHER_KEY = 'another-key'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('persists the initial value to empty storage on mount', async () => {
    const { result } = await renderHook(() => useLocalStorage(KEY, 'a'))

    expect(result.current[0]).toBe('a')
    expect(localStorage.getItem(KEY)).toBe('a')
  })

  it('uses the stored value when present', async () => {
    localStorage.setItem(KEY, 'b')

    const { result } = await renderHook(() => useLocalStorage(KEY, 'a'))

    expect(result.current[0]).toBe('b')
    expect(localStorage.getItem(KEY)).toBe('b')
  })

  it('reads pre-seeded values across types', async () => {
    localStorage.setItem(KEY, 'true')
    const booleanHook = await renderHook(() => useLocalStorage(KEY, false))
    expect(booleanHook.result.current[0]).toBe(true)

    localStorage.setItem(KEY, '0')
    const numberHook = await renderHook(() => useLocalStorage(KEY, 1))
    expect(numberHook.result.current[0]).toBe(0)

    localStorage.setItem(KEY, JSON.stringify({}))
    const objectHook = await renderHook(() => useLocalStorage(KEY, { a: 1 }))
    expect(objectHook.result.current[0]).toEqual({})

    localStorage.setItem(KEY, '')
    const emptyHook = await renderHook(() => useLocalStorage<string | null>(KEY, null))
    expect(emptyHook.result.current[0]).toBe('')

    localStorage.setItem(KEY, JSON.stringify([]))
    const mapHook = await renderHook(() => useLocalStorage(KEY, new Map([[1, 2]])))
    expect(mapHook.result.current[0]).toEqual(new Map())

    localStorage.setItem(KEY, JSON.stringify([]))
    const setHook = await renderHook(() => useLocalStorage(KEY, new Set([1, 2])))
    expect(setHook.result.current[0]).toEqual(new Set())
  })

  it('starts null with a null initial value on empty storage', async () => {
    const { result } = await renderHook(() => useLocalStorage<string | null>(KEY, null))

    expect(result.current[0]).toBeNull()
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('reads a raw string with a null initial value', async () => {
    localStorage.setItem(KEY, 'null')

    const { result } = await renderHook(() => useLocalStorage<string | null>(KEY, null))

    expect(result.current[0]).toBe('null')
    expect(localStorage.getItem(KEY)).toBe('null')
  })

  it('setValue persists string values', async () => {
    const { result, act } = await renderHook(() => useLocalStorage(KEY, 'a'))

    await act(() => {
      result.current[1]('b')
    })
    expect(result.current[0]).toBe('b')
    expect(localStorage.getItem(KEY)).toBe('b')
  })

  it('setValue persists number values', async () => {
    localStorage.setItem(KEY, '0')

    const { result, act } = await renderHook(() => useLocalStorage(KEY, 1))
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
    const { result, act } = await renderHook(() => useLocalStorage(KEY, true))

    expect(result.current[0]).toBe(true)
    expect(localStorage.getItem(KEY)).toBe('true')

    await act(() => {
      result.current[1](false)
    })
    expect(result.current[0]).toBe(false)
    expect(localStorage.getItem(KEY)).toBe('false')
  })

  it('setValue persists objects as JSON', async () => {
    const { result, act } = await renderHook(() => useLocalStorage(KEY, { name: 'a', data: 123 }))

    expect(result.current[0]).toEqual({ name: 'a', data: 123 })
    expect(localStorage.getItem(KEY)).toBe('{"name":"a","data":123}')

    await act(() => {
      result.current[1]({ name: 'b', data: 321 })
    })
    expect(result.current[0]).toEqual({ name: 'b', data: 321 })
    expect(localStorage.getItem(KEY)).toBe('{"name":"b","data":321}')
  })

  it('setValue supports a function updater', async () => {
    const { result, act } = await renderHook(() => useLocalStorage(KEY, 1))

    await act(() => {
      result.current[1](prev => (prev ?? 0) + 1)
    })
    expect(result.current[0]).toBe(2)
    expect(localStorage.getItem(KEY)).toBe('2')
  })

  it('supports a lazy function initial value', async () => {
    const { result } = await renderHook(() => useLocalStorage(KEY, () => ({ lazy: true })))

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

    const lazy = await renderHook(() => useLocalStorage(KEY, () => typed))
    expect(lazy.result.current[0]).toEqual(typed)
    await lazy.unmount()

    localStorage.removeItem(KEY)
    const plain = await renderHook(() => useLocalStorage(KEY, typed))
    expect(plain.result.current[0]).toEqual(typed)
    await plain.unmount()
  })

  it('setValue(null) removes the entry and restores the initial value', async () => {
    const { result, act } = await renderHook(() => useLocalStorage(KEY, 'a'))

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
    const { result, act } = await renderHook(() => useLocalStorage<string | null>(KEY, null))

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
    const { result, act } = await renderHook(() => useLocalStorage(KEY, new Date('2000-01-02T00:00:00.000Z')))

    expect(localStorage.getItem(KEY)).toBe('2000-01-02T00:00:00.000Z')
    expect(result.current[0]).toEqual(new Date('2000-01-02T00:00:00.000Z'))

    await act(() => {
      result.current[1](new Date('2000-01-03T00:00:00.000Z'))
    })
    expect(localStorage.getItem(KEY)).toBe('2000-01-03T00:00:00.000Z')
  })

  it('persists Map values', async () => {
    const { result, act } = await renderHook(() => useLocalStorage(KEY, new Map<number, string | number>([[1, 'a'], [2, 2]])))

    expect(localStorage.getItem(KEY)).toBe('[[1,"a"],[2,2]]')
    expect(result.current[0]).toEqual(new Map<number, string | number>([[1, 'a'], [2, 2]]))

    await act(() => {
      result.current[1](new Map<number, string | number>([[1, 'c'], [2, 3]]))
    })
    expect(localStorage.getItem(KEY)).toBe('[[1,"c"],[2,3]]')
  })

  it('persists Set values', async () => {
    const { result, act } = await renderHook(() => useLocalStorage(KEY, new Set<string | number>([1, '2'])))

    expect(localStorage.getItem(KEY)).toBe('[1,"2"]')
    expect(result.current[0]).toEqual(new Set<string | number>([1, '2']))

    await act(() => {
      result.current[1](new Set<string | number>([1, '2', '1']))
    })
    expect(localStorage.getItem(KEY)).toBe('[1,"2","1"]')
  })

  it('writeDefaults: false leaves empty storage untouched', async () => {
    const { result } = await renderHook(() => useLocalStorage(KEY, 'a', { writeDefaults: false }))

    expect(result.current[0]).toBe('a')
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('mergeDefaults merges the stored value with the default', async () => {
    // basic
    localStorage.setItem(KEY, '0')
    const basic = await renderHook(() => useLocalStorage(KEY, 1, { mergeDefaults: true }))
    expect(basic.result.current[0]).toBe(0)
    await basic.unmount()

    // object
    localStorage.setItem(KEY, JSON.stringify({ a: 1 }))
    const object = await renderHook(() => useLocalStorage(KEY, { a: 2, b: 3 }, { mergeDefaults: true }))
    expect(object.result.current[0]).toEqual({ a: 1, b: 3 })
    await object.unmount()

    // array
    localStorage.setItem(KEY, JSON.stringify([1]))
    const array = await renderHook(() => useLocalStorage(KEY, [2], { mergeDefaults: true }))
    expect(array.result.current[0]).toEqual([1])
    await array.unmount()

    // custom function
    localStorage.setItem(KEY, JSON.stringify([{ a: 1 }]))
    const custom = await renderHook(() => useLocalStorage(KEY, [{ a: 3 }], {
      mergeDefaults: (value, initial) => [...initial, ...value],
    }))
    expect(custom.result.current[0]).toEqual([{ a: 3 }, { a: 1 }])
    await custom.unmount()

    // custom function 2
    localStorage.setItem(KEY, '1')
    const sum = await renderHook(() => useLocalStorage(KEY, 2, { mergeDefaults: (value, initial) => value + initial }))
    expect(sum.result.current[0]).toBe(3)
  })

  it('supports a custom serializer', async () => {
    const { result, act } = await renderHook(() => useLocalStorage<number | object>(KEY, 0, {
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
      ({ key }: { key: string } = { key: KEY }) => useLocalStorage(key, '0'),
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
      ({ key }: { key: string } = { key: KEY }) => useLocalStorage(key, 0),
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
    const first = await renderHook(() => useLocalStorage(KEY, 0))
    const second = await renderHook(() => useLocalStorage(KEY, 0))

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
    const { result, act } = await renderHook(() => useLocalStorage(KEY, 0))

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
    const { result, act } = await renderHook(() => useLocalStorage(KEY, 0))

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
    const { result, unmount, act } = await renderHook(() => useLocalStorage(KEY, 0))
    unmount()

    localStorage.setItem(KEY, '9')
    await act(() => {
      window.dispatchEvent(new StorageEvent('storage', { storageArea: localStorage, key: KEY, newValue: '9' }))
    })
    expect(result.current[0]).toBe(0)
  })

  it('falls back to in-memory state when no storage is available', async () => {
    const { result, act } = await renderHook(() => useLocalStorage(KEY, 'a', { window: {} as Window }))

    expect(result.current[0]).toBe('a')

    await act(() => {
      result.current[1]('b')
    })
    expect(result.current[0]).toBe('b')
    expect(localStorage.getItem(KEY)).toBeNull()
  })
})
