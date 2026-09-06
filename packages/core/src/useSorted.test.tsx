import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useSorted } from './useSorted'

interface User {
  name: string
  age: number
}

const arr = [10, 3, 5, 7, 2, 1, 8, 6, 9, 4]
const arrSorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const objArr: User[] = [
  { name: 'John', age: 40 },
  { name: 'Jane', age: 20 },
  { name: 'Joe', age: 30 },
  { name: 'Jenny', age: 22 },
]
const objectSorted: User[] = [
  { name: 'Jane', age: 20 },
  { name: 'Jenny', age: 22 },
  { name: 'Joe', age: 30 },
  { name: 'John', age: 40 },
]

it('useSorted is defined', () => {
  expect(useSorted).toBeTypeOf('function')
})

it('useSorted sorts numbers by default and leaves the source untouched', async () => {
  const { result } = await renderHook(() => useSorted(arr))

  expect(result.current).toEqual(arrSorted)
  // non-mutating: upstream sorts a copy (`sortFn([...toValue(source)])`)
  expect(arr).toEqual([10, 3, 5, 7, 2, 1, 8, 6, 9, 4])
})

it('useSorted sorts objects with a custom compare function', async () => {
  const { result } = await renderHook(() => useSorted(objArr, (a, b) => a.age - b.age))

  expect(result.current).toEqual(objectSorted)
})

it('useSorted accepts a getter source', async () => {
  const { result } = await renderHook(() => useSorted(() => arr))

  expect(result.current).toEqual(arrSorted)
})

it('useSorted re-sorts when the source changes', async () => {
  const { result, rerender } = await renderHook(
    (props?: { source: number[] }) => useSorted(props?.source ?? arr),
    { initialProps: { source: [10, 3, 5] } },
  )

  expect(result.current).toEqual([3, 5, 10])

  await rerender({ source: [42, 7, 1] })
  expect(result.current).toEqual([1, 7, 42])
})

it('useSorted re-sorts when the compare function changes', async () => {
  const { result, rerender } = await renderHook(
    (props?: { compareFn?: (a: number, b: number) => number }) => useSorted([1, 3, 2], props?.compareFn),
    { initialProps: {} },
  )

  expect(result.current).toEqual([1, 2, 3])

  await rerender({ compareFn: (a: number, b: number) => b - a })
  expect(result.current).toEqual([3, 2, 1])
})

it('useSorted keeps the relative order of equal elements (stable sort)', async () => {
  const keyed = [
    { key: 1, tag: 'a' },
    { key: 1, tag: 'b' },
    { key: 0, tag: 'c' },
    { key: 1, tag: 'd' },
  ]
  const { result } = await renderHook(() => useSorted(keyed, (a, b) => a.key - b.key))

  expect(result.current.map(item => item.tag)).toEqual(['c', 'a', 'b', 'd'])
})
