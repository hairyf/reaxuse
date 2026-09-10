import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { deepClone, deepEqual, useWatchDeep } from '../useWatchDeep'

interface NestedValue {
  foo: { bar: { deep: number } }
}

interface WatchCall {
  value: NestedValue
  oldValue: NestedValue | undefined
}

it('useWatchDeep fires when a nested value is updated (component)', async () => {
  const calls: NestedValue[] = []

  function NestedDemo() {
    const [obj, setObj] = useState<NestedValue>({ foo: { bar: { deep: 5 } } })
    useWatchDeep(obj, value => calls.push(value))
    return <button onClick={() => setObj({ foo: { bar: { deep: 10 } } })}>update-nested</button>
  }

  const screen = await render(<NestedDemo />)
  expect(calls).toEqual([])

  await screen.getByRole('button', { name: 'update-nested' }).click()
  expect(calls).toEqual([{ foo: { bar: { deep: 10 } } }])

  // replacing the state with a deep-equal value again — no additional fire
  await screen.getByRole('button', { name: 'update-nested' }).click()
  expect(calls).toEqual([{ foo: { bar: { deep: 10 } } }])
})

it('useWatchDeep ignores reassignments that are deeply equal (component)', async () => {
  const calls: NestedValue[] = []

  function CloneDemo() {
    const [obj, setObj] = useState<NestedValue>({ foo: { bar: { deep: 5 } } })
    useWatchDeep(obj, value => calls.push(value))
    return (
      <div>
        <button onClick={() => setObj({ foo: { bar: { deep: obj.foo.bar.deep } } })}>reassign-equal</button>
        <button onClick={() => setObj({ foo: { bar: { deep: 6 } } })}>update-nested</button>
      </div>
    )
  }

  const screen = await render(<CloneDemo />)
  expect(calls).toEqual([])

  // new top-level reference with deeply equal contents — must not fire
  await screen.getByRole('button', { name: 'reassign-equal' }).click()
  expect(calls).toEqual([])

  // a real nested change fires
  await screen.getByRole('button', { name: 'update-nested' }).click()
  expect(calls).toEqual([{ foo: { bar: { deep: 6 } } }])
})

it('useWatchDeep fires on mount with immediate: true (renderHook)', async () => {
  const calls: WatchCall[] = []
  let setValue: (value: NestedValue) => void = () => {}

  const { act } = await renderHook(() => {
    const [value, update] = useState<NestedValue>({ foo: { bar: { deep: 5 } } })
    setValue = update
    useWatchDeep(value, (next, prev) => calls.push({ value: next, oldValue: prev }), { immediate: true })
  })

  expect(calls).toEqual([{ value: { foo: { bar: { deep: 5 } } }, oldValue: undefined }])

  // deep-equal reassignment after mount — still silent
  await act(() => setValue({ foo: { bar: { deep: 5 } } }))
  expect(calls).toEqual([{ value: { foo: { bar: { deep: 5 } } }, oldValue: undefined }])

  await act(() => setValue({ foo: { bar: { deep: 7 } } }))
  expect(calls).toEqual([
    { value: { foo: { bar: { deep: 5 } } }, oldValue: undefined },
    { value: { foo: { bar: { deep: 7 } } }, oldValue: { foo: { bar: { deep: 5 } } } },
  ])
})

it('useWatchDeep does not fire on mount and fires with (value, oldValue) on change (renderHook)', async () => {
  const calls: WatchCall[] = []
  let setValue: (value: NestedValue) => void = () => {}

  const { act } = await renderHook(() => {
    const [value, update] = useState<NestedValue>({ foo: { bar: { deep: 5 } } })
    setValue = update
    useWatchDeep(value, (next, prev) => calls.push({ value: next, oldValue: prev }))
  })

  expect(calls).toEqual([])

  await act(() => setValue({ foo: { bar: { deep: 10 } } }))
  expect(calls).toEqual([
    { value: { foo: { bar: { deep: 10 } } }, oldValue: { foo: { bar: { deep: 5 } } } },
  ])

  // deep-equal reassignment — no additional fire
  await act(() => setValue({ foo: { bar: { deep: 10 } } }))
  expect(calls).toEqual([
    { value: { foo: { bar: { deep: 10 } } }, oldValue: { foo: { bar: { deep: 5 } } } },
  ])
})

it('useWatchDeep supports array sources and only fires when an element deeply changes (component)', async () => {
  const calls: Array<{ value: Array<{ id: number }>, oldValue: Array<{ id: number }> | undefined }> = []

  function ArrayWatchDemo() {
    const [items, setItems] = useState<Array<{ id: number }>>([{ id: 1 }])
    const [unrelated, setUnrelated] = useState(0)
    useWatchDeep(items, (value, oldValue) => calls.push({ value, oldValue }))
    return (
      <div>
        <button onClick={() => setItems(items.map(item => ({ ...item })))}>clone-items</button>
        <button onClick={() => setItems([{ id: 2 }])}>update-item</button>
        <button onClick={() => setUnrelated(unrelated + 1)}>bump-unrelated</button>
      </div>
    )
  }

  const screen = await render(<ArrayWatchDemo />)
  expect(calls).toEqual([])

  // new element references, deeply equal contents — no fire
  await screen.getByRole('button', { name: 'clone-items' }).click()
  expect(calls).toEqual([])

  // an unrelated state change re-renders but must not fire the watch
  await screen.getByRole('button', { name: 'bump-unrelated' }).click()
  expect(calls).toEqual([])

  // a deep change inside an element fires with (value, oldValue)
  await screen.getByRole('button', { name: 'update-item' }).click()
  expect(calls).toEqual([{ value: [{ id: 2 }], oldValue: [{ id: 1 }] }])
})

describe('deepEqual', () => {
  it('compares primitives with Object.is and null/type guards', () => {
    expect(deepEqual(1, 1)).toBe(true)
    expect(deepEqual(Number.NaN, Number.NaN)).toBe(true)
    expect(deepEqual(1, '1')).toBe(false)
    expect(deepEqual(null, undefined)).toBe(false)
    expect(deepEqual({}, null)).toBe(false)
  })

  it('compares Dates and RegExps by content', () => {
    expect(deepEqual(new Date(1700000000000), new Date(1700000000000))).toBe(true)
    expect(deepEqual(new Date(1), new Date(2))).toBe(false)
    expect(deepEqual(/ab/gi, /ab/gi)).toBe(true)
    expect(deepEqual(/ab/gi, /ab/g)).toBe(false)
    expect(deepEqual(/ab/, /ba/)).toBe(false)
  })

  it('compares arrays element-wise (deeply)', () => {
    expect(deepEqual([{ a: 1 }], [{ a: 1 }])).toBe(true)
    expect(deepEqual([{ a: 1 }], [{ a: 2 }])).toBe(false)
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false)
  })

  it('compares Map values deeply and keys by reference', () => {
    const key = { id: 1 }
    expect(deepEqual(new Map([[key, { a: 1 }]]), new Map([[key, { a: 1 }]]))).toBe(true)
    expect(deepEqual(new Map([[key, { a: 1 }]]), new Map([[key, { a: 2 }]]))).toBe(false)
    // a different-but-deep-equal key is NOT matched (keys are reference-compared)
    expect(deepEqual(new Map([[{ id: 1 }, 'x']]), new Map([[{ id: 1 }, 'x']]))).toBe(false)
    expect(deepEqual(new Map([[key, 1]]), new Map())).toBe(false)
  })

  it('compares Set items deeply and unordered', () => {
    expect(deepEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true)
    // previously false — Set items were reference-compared while deepClone
    // clones them; now paired via deep item matching
    expect(deepEqual(new Set([{ a: 1 }]), new Set([{ a: 1 }]))).toBe(true)
    expect(deepEqual(new Set([{ a: 1 }]), new Set([{ a: 2 }]))).toBe(false)
    expect(deepEqual(new Set([1]), new Set([1, 2]))).toBe(false)
  })

  it('compares class instances by constructor and keys', () => {
    class Point {
      constructor(public x: number) {}
    }
    expect(deepEqual(new Point(1), new Point(1))).toBe(true)
    expect(deepEqual(new Point(1), new Point(2))).toBe(false)
    expect(deepEqual(new Point(1), { x: 1 })).toBe(false)
  })

  it('compares functions by reference', () => {
    const fn = () => {}
    expect(deepEqual(fn, fn)).toBe(true)
    expect(deepEqual(fn, () => {})).toBe(false)
  })
})

describe('deepClone', () => {
  it('clones structurally and keeps deepEqual round-trips', () => {
    class Point {
      constructor(public x: number) {}
    }
    const key = { id: 1 }
    const original = {
      date: new Date(1700000000000),
      regexp: /ab/gi,
      array: [{ a: 1 }],
      map: new Map([[key, { a: 1 }]]),
      set: new Set([{ a: 1 }, 2]),
      point: new Point(3),
      fn: () => {},
    }
    const cloned = deepClone(original)

    expect(cloned).not.toBe(original)
    expect(cloned.date).not.toBe(original.date)
    expect(cloned.set).not.toBe(original.set)
    expect(cloned.set.has(original.array[0])).toBe(false)
    // class instances clone back into their class (prototype preserved)
    expect(cloned.point).toBeInstanceOf(Point)
    expect(deepEqual(cloned, original)).toBe(true)
  })

  it('passes primitives and functions through', () => {
    const fn = () => {}
    expect(deepClone(42)).toBe(42)
    expect(deepClone('x')).toBe('x')
    expect(deepClone(null)).toBe(null)
    expect(deepClone(fn)).toBe(fn)
  })
})
