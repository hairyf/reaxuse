import { useState } from 'react'
import { expect, expectTypeOf, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { usePrevious } from '../usePrevious'

it('usePrevious is undefined before the first change', async () => {
  const { result } = await renderHook((props?: { value?: number }) => usePrevious(props?.value), { initialProps: { value: 1 } })

  expect(result.current).toBe(undefined)
})

it('usePrevious exposes the previous value after a change', async () => {
  const { result, rerender } = await renderHook((props?: { value?: number }) => usePrevious(props?.value), { initialProps: { value: 1 } })

  await rerender({ value: 2 })

  expect(result.current).toBe(1)
})

it('usePrevious stays one change behind across a sequence of changes', async () => {
  const { result, rerender } = await renderHook((props?: { value?: number }) => usePrevious(props?.value), { initialProps: { value: 1 } })

  await rerender({ value: 2 })
  expect(result.current).toBe(1)

  await rerender({ value: 10 })
  expect(result.current).toBe(2)
})

it('usePrevious reports the previous render value when the value is unchanged', async () => {
  const { result, rerender } = await renderHook((props?: { value?: number }) => usePrevious(props?.value), { initialProps: { value: 1 } })

  await rerender({ value: 2 })
  expect(result.current).toBe(1)

  // unchanged rerender: the previous render's value is the same value
  await rerender({ value: 2 })
  expect(result.current).toBe(2)
})

it('usePrevious works with an initial value (2-arg overload)', async () => {
  // mirrors upstream `works with initial value` — the seed is read until the
  // first committed change replaces it with the source's own first value
  const { result, rerender } = await renderHook((props?: { value?: string }) => usePrevious(props?.value, 'initial'), { initialProps: { value: 'Hello' } })

  expect(result.current).toBe('initial')

  await rerender({ value: 'World' })
  expect(result.current).toBe('Hello')

  await rerender({ value: 'Mars' })
  expect(result.current).toBe('World')
})

it('usePrevious types the overloaded returns like upstream', () => {
  // declared but never called — type-level assertions only, no hooks run
  // (a `string`-typed variable keeps `T = string`; literal args would narrow
  // the inferred return to `"a" | undefined` / `"a" | "seed"`)
  const value: string = 'a'
  const oneArg = () => usePrevious(value)
  const twoArg = () => usePrevious(value, 'seed')

  expectTypeOf(oneArg).returns.toEqualTypeOf<string | undefined>()
  expectTypeOf(twoArg).returns.toEqualTypeOf<string>()
})

it('usePrevious reports the previous committed value when same-tick changes are batched', async () => {
  const { result, act } = await renderHook(() => {
    const [value, setValue] = useState('A')
    const previous = usePrevious(value)
    return { value, previous, setValue }
  })

  expect(result.current.value).toBe('A')
  expect(result.current.previous).toBe(undefined)

  // A→B→C in a single act: React collapses the same-tick updates into one
  // commit carrying only the final value, so the intermediate 'B' is never
  // rendered. The hook reports the last committed value ('A'); Vue's sync
  // watch would have reported 'B' (documented divergence in the JSDoc).
  await act(() => {
    result.current.setValue('B')
    result.current.setValue('C')
  })

  expect(result.current.value).toBe('C')
  expect(result.current.previous).toBe('A')

  // a later committed change advances the tracked value
  await act(() => {
    result.current.setValue('D')
  })

  expect(result.current.previous).toBe('C')
})

it('usePrevious tracks objects by reference, not nested mutations', async () => {
  const target = { a: 1 }
  const { result, rerender } = await renderHook((props?: { value?: { a: number } }) => usePrevious(props?.value), { initialProps: { value: target } })

  expect(result.current).toBe(undefined)

  // a nested mutation with the same reference is not a new value
  target.a = 2
  await rerender({ value: target })
  expect(result.current).toBe(target)

  // a new reference exposes the previous object
  const next = { a: 3 }
  await rerender({ value: next })
  expect(result.current).toBe(target)
})

it('usePrevious does not update after unmount', async () => {
  const { result, rerender, unmount } = await renderHook((props?: { value?: number }) => usePrevious(props?.value), { initialProps: { value: 1 } })

  await rerender({ value: 2 })
  expect(result.current).toBe(1)

  unmount()

  // the hook only mutates a ref inside an effect — nothing touches it after
  // unmount, so the last rendered value simply freezes
  expect(result.current).toBe(1)
})
