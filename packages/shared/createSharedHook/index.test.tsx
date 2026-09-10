import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { createSharedHook } from '../createSharedHook'

// the wrapped hook is free to use React hooks internally: this is the state
// container shared between every consumer of the returned hook
function useCounter(initial: number) {
  const [count, setCount] = useState(initial)

  return { count, setCount }
}

describe('createSharedHook', () => {
  it('is defined', () => {
    expect(createSharedHook).toBeTypeOf('function')
  })

  it('shares one instance between every consumer in the same tree', async () => {
    const seen: unknown[] = []
    const useSharedCounter = createSharedHook(useCounter)

    function Consumer({ label }: { label: string }) {
      const shared = useSharedCounter(0)
      seen.push(shared)

      return (
        <div>
          <span>{`${label}: ${shared.count}`}</span>
          <button onClick={() => shared.setCount(current => current + 1)}>{`inc-${label}`}</button>
        </div>
      )
    }

    const screen = await render(
      <div>
        <Consumer label="a" />
        <Consumer label="b" />
      </div>,
    )

    await expect.element(screen.getByText('a: 0')).toBeVisible()
    await expect.element(screen.getByText('b: 0')).toBeVisible()

    // both consumers received the exact same value instance on their first
    // render — never `undefined`
    expect(seen[0]).toBe(seen[1])

    // a write through the first consumer is seen by the second one
    await screen.getByRole('button', { name: 'inc-a' }).click()
    await expect.element(screen.getByText('a: 1')).toBeVisible()
    await expect.element(screen.getByText('b: 1')).toBeVisible()

    // ...and the other way round (the shared setters all belong to the
    // creator, so writing through the second consumer re-renders it)
    await screen.getByRole('button', { name: 'inc-b' }).click()
    await expect.element(screen.getByText('a: 2')).toBeVisible()
    await expect.element(screen.getByText('b: 2')).toBeVisible()
  })

  it('shares one instance across separate render roots', async () => {
    const useSharedCounter = createSharedHook(useCounter)

    function Counter({ label }: { label: string }) {
      const { count, setCount } = useSharedCounter(0)

      return <button onClick={() => setCount(current => current + 1)}>{`${label}: ${count}`}</button>
    }

    const first = await render(<Counter label="first" />)
    await first.getByRole('button', { name: 'first: 0' }).click()
    await expect.element(first.getByRole('button', { name: 'first: 1' })).toBeVisible()

    // a second, independent consumer joins the instance that is still alive
    // and reads the already-published value on its first render
    const second = await render(<Counter label="second" />)
    await expect.element(second.getByRole('button', { name: 'second: 1' })).toBeVisible()

    await second.getByRole('button', { name: 'second: 1' }).click()
    await expect.element(second.getByRole('button', { name: 'second: 2' })).toBeVisible()
    await expect.element(first.getByRole('button', { name: 'first: 2' })).toBeVisible()
  })

  it('keeps the instance alive while at least one consumer stays mounted', async () => {
    const teardown = vi.fn()
    const useSharedCounter = createSharedHook(useCounter, teardown)

    function Counter({ label }: { label: string }) {
      const { count, setCount } = useSharedCounter(0)

      return <button onClick={() => setCount(current => current + 1)}>{`${label}: ${count}`}</button>
    }

    const first = await render(<Counter label="first" />)
    const second = await render(<Counter label="second" />)
    await expect.element(first.getByRole('button', { name: 'first: 0' })).toBeVisible()
    await expect.element(second.getByRole('button', { name: 'second: 0' })).toBeVisible()

    // a non-creator consumer leaves; the creator keeps the instance alive
    await second.unmount()
    expect(teardown).not.toHaveBeenCalled()

    await first.getByRole('button', { name: 'first: 0' }).click()
    await expect.element(first.getByRole('button', { name: 'first: 1' })).toBeVisible()

    // a new consumer joins the still-live instance and sees its value
    const third = await render(<Counter label="third" />)
    await expect.element(third.getByRole('button', { name: 'third: 1' })).toBeVisible()
  })

  it('runs teardown exactly once when the last consumer unmounts, and a later mount starts fresh', async () => {
    const teardown = vi.fn()
    const useSharedCounter = createSharedHook(useCounter, teardown)

    function Counter({ label }: { label: string }) {
      const { count, setCount } = useSharedCounter(0)

      return <button onClick={() => setCount(current => current + 1)}>{`${label}: ${count}`}</button>
    }

    const first = await render(<Counter label="first" />)
    const second = await render(<Counter label="second" />)
    await first.getByRole('button', { name: 'first: 0' }).click()
    await expect.element(first.getByRole('button', { name: 'first: 1' })).toBeVisible()
    await expect.element(second.getByRole('button', { name: 'second: 1' })).toBeVisible()

    // one consumer left — no teardown yet
    await first.unmount()
    expect(teardown).not.toHaveBeenCalled()

    // the last consumer leaves — teardown runs exactly once
    await second.unmount()
    expect(teardown).toHaveBeenCalledTimes(1)

    // a mount after the teardown starts a fresh instance
    const third = await render(<Counter label="third" />)
    await expect.element(third.getByRole('button', { name: 'third: 0' })).toBeVisible()
  })

  it('keeps the first consumer arguments and ignores the later ones', async () => {
    const useSharedCounter = createSharedHook(useCounter)

    const first = await renderHook(() => useSharedCounter(5))
    expect(first.result.current.count).toBe(5)

    // upstream runs the composable once, with the first call's arguments
    const second = await renderHook(() => useSharedCounter(99))
    expect(second.result.current.count).toBe(5)
    // and the later consumer receives the very same instance
    expect(second.result.current).toBe(first.result.current)
  })
})
