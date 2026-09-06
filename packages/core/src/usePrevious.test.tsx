import { expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { usePrevious } from './usePrevious'

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
