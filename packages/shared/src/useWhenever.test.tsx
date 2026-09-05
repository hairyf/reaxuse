import { useState } from 'react'
import { expect, expectTypeOf, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useWhenever } from './useWhenever'

it('useWhenever ignores falsy state change (component)', async () => {
  const calls: [number, number | null | undefined][] = []

  function UseWheneverDemo() {
    const [number, setNumber] = useState<number | null>(1)

    useWhenever(number, (value, oldValue) => {
      expectTypeOf(value).toEqualTypeOf<number>()
      // @ts-expect-error value should be of type number
      expectTypeOf(value).toEqualTypeOf<null>()
      calls.push([value, oldValue])
    })

    return (
      <>
        <button onClick={() => setNumber(2)}>to-2</button>
        <button onClick={() => setNumber(null)}>to-null</button>
        <button onClick={() => setNumber(3)}>to-3</button>
      </>
    )
  }

  const screen = await render(<UseWheneverDemo />)

  // initial truthy value does not fire without `immediate`
  expect(calls).toEqual([])

  await screen.getByRole('button', { name: 'to-2' }).click()
  expect(calls).toEqual([[2, 1]])

  // falsy transition: no fire
  await screen.getByRole('button', { name: 'to-null' }).click()
  expect(calls).toEqual([[2, 1]])

  // fires again, with the falsy value as oldValue
  await screen.getByRole('button', { name: 'to-3' }).click()
  expect(calls).toEqual([[2, 1], [3, null]])
})

it('useWhenever mirrors upstream immediate semantics (component)', async () => {
  const lazy: number[] = []
  const eager: number[] = []

  function UseWheneverDemo() {
    const [number, setNumber] = useState<number | null>(null)

    useWhenever(number, v => lazy.push(v), { immediate: false })
    useWhenever(number, v => eager.push(v), { immediate: true })

    return (
      <>
        <button onClick={() => setNumber(1)}>to-1</button>
        <button onClick={() => setNumber(2)}>to-2</button>
      </>
    )
  }

  const screen = await render(<UseWheneverDemo />)

  // immediate with a falsy initial value still does not fire
  expect(lazy).toEqual([])
  expect(eager).toEqual([])

  await screen.getByRole('button', { name: 'to-1' }).click()
  expect(lazy).toEqual([1])
  expect(eager).toEqual([1])

  await screen.getByRole('button', { name: 'to-2' }).click()
  expect(lazy).toEqual([1, 2])
  expect(eager).toEqual([1, 2])
})

it('useWhenever does not fire when the truthy value stays the same (renderHook)', async () => {
  const calls: number[] = []

  const { rerender } = await renderHook<{ value: number }, void>(({ value } = { value: 1 }) => {
    useWhenever(value, v => calls.push(v))
  }, { initialProps: { value: 1 } })

  await rerender({ value: 1 })
  await rerender({ value: 1 })

  expect(calls).toEqual([])
})

it('useWhenever passes the previous value as oldValue, advancing through falsy values (renderHook)', async () => {
  const calls: [string, string | null | undefined][] = []

  const { rerender } = await renderHook<{ value: string | null }, void>(({ value } = { value: null }) => {
    useWhenever(value, (v, oldValue) => calls.push([v, oldValue]))
  }, { initialProps: { value: null } })

  await rerender({ value: 'a' })
  await rerender({ value: null })
  await rerender({ value: 'b' })

  expect(calls).toEqual([['a', null], ['b', null]])
})

it('useWhenever does not fire on mount without immediate (renderHook)', async () => {
  const calls: number[] = []

  await renderHook(() => {
    useWhenever(1, v => calls.push(v))
  })

  expect(calls).toEqual([])
})

it('useWhenever fires on mount with immediate when the value is truthy (renderHook)', async () => {
  const calls: [number, number | undefined][] = []

  await renderHook(() => {
    useWhenever(1, (v, oldValue) => calls.push([v, oldValue]), { immediate: true })
  })

  expect(calls).toEqual([[1, undefined]])
})

it('useWhenever does not fire on mount with immediate when the value is falsy (renderHook)', async () => {
  const calls: number[] = []

  await renderHook(() => {
    useWhenever(0, v => calls.push(v), { immediate: true })
  })

  expect(calls).toEqual([])
})
