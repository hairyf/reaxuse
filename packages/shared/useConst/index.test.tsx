import { useState } from 'react'
import { expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useConst } from '../useConst'

function FactoryDemo({ factory }: { factory: () => string }) {
  const value = useConst(factory)
  const [renders, setRenders] = useState(1)

  return (
    <div>
      <span>{`value: ${value}`}</span>
      <span>{`renders: ${renders}`}</span>
      <button type="button" onClick={() => setRenders(current => current + 1)}>
        Rerender
      </button>
    </div>
  )
}

it('useConst returns the initial value on the first render', async () => {
  const { result } = await renderHook(() => useConst(42))

  expect(result.current).toBe(42)
})

it('useConst evaluates a function initial value exactly once across re-renders', async () => {
  const factory = vi.fn(() => 'computed-once')
  const screen = await render(<FactoryDemo factory={factory} />)

  await expect.element(screen.getByText('value: computed-once')).toBeVisible()
  expect(factory).toHaveBeenCalledTimes(1)

  // several re-renders — the factory must not run again
  await screen.getByRole('button', { name: 'Rerender' }).click()
  await screen.getByRole('button', { name: 'Rerender' }).click()
  await expect.element(screen.getByText('renders: 3')).toBeVisible()

  expect(factory).toHaveBeenCalledTimes(1)
  await expect.element(screen.getByText('value: computed-once')).toBeVisible()
})

it('useConst keeps the same identity across re-renders, unlike an inline value', async () => {
  const kept: object[] = []
  const inline: object[] = []

  function IdentityDemo() {
    // stable: computed once, then returned unchanged
    const stable = useConst(() => ({ stable: true }))
    // naive: a brand new object on every render
    const unstable = { stable: true }
    kept.push(stable)
    inline.push(unstable)

    const [renders, setRenders] = useState(1)
    return (
      <div>
        <span>{`renders: ${renders}`}</span>
        <button type="button" onClick={() => setRenders(current => current + 1)}>
          Rerender
        </button>
      </div>
    )
  }

  const screen = await render(<IdentityDemo />)
  await screen.getByRole('button', { name: 'Rerender' }).click()
  await screen.getByRole('button', { name: 'Rerender' }).click()
  await expect.element(screen.getByText('renders: 3')).toBeVisible()

  expect(kept).toHaveLength(3)
  expect(kept[1]).toBe(kept[0])
  expect(kept[2]).toBe(kept[0])
  // the inline object is rebuilt on every render — precisely what useConst avoids
  expect(inline[1]).not.toBe(inline[0])
})

it('useConst does not re-evaluate an expensive factory on re-render', async () => {
  const expensive = vi.fn(() => ({ heavy: [0, 1, 2] }))
  const { result, rerender } = await renderHook(() => useConst(expensive))

  const first = result.current
  expect(expensive).toHaveBeenCalledTimes(1)

  await rerender()
  await rerender()

  expect(expensive).toHaveBeenCalledTimes(1)
  expect(result.current).toBe(first)
  expect(result.current.heavy).toEqual([0, 1, 2])
})

it('useConst ignores initialValue changes after the first render', async () => {
  function PropDemo({ value }: { value: number }) {
    const kept = useConst(value)
    return <span>{`kept: ${kept}`}</span>
  }

  const screen = await render(<PropDemo value={1} />)
  await expect.element(screen.getByText('kept: 1')).toBeVisible()

  // re-render with a different argument — the first value is kept
  await screen.rerender(<PropDemo value={2} />)
  await expect.element(screen.getByText('kept: 1')).toBeVisible()
})
