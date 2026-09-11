import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useLastChanged } from '../useLastChanged'

describe('useLastChanged', () => {
  it('returns null until the value changes', async () => {
    let value = 0
    const { result, rerender } = await renderHook(() => useLastChanged(value))

    expect(result.current).toBe(null)

    value = 1
    await rerender()
    expect(result.current).toBeTypeOf('number')
    expect(result.current).toBeGreaterThan(0)
  })

  it('records a new timestamp on every change', async () => {
    let value = 0
    const { result, rerender } = await renderHook(() => useLastChanged(value))

    const firstBefore = Date.now()
    value = 1
    await rerender()
    const firstAfter = Date.now()
    expect(result.current).toBeGreaterThanOrEqual(firstBefore)
    expect(result.current).toBeLessThanOrEqual(firstAfter)

    const secondBefore = Date.now()
    value = 2
    await rerender()
    const secondAfter = Date.now()
    expect(result.current).toBeGreaterThanOrEqual(secondBefore)
    expect(result.current).toBeLessThanOrEqual(secondAfter)
  })

  it('keeps the timestamp when the value is unchanged', async () => {
    let value = 0
    const { result, rerender } = await renderHook(() => useLastChanged(value))

    value = 1
    await rerender()
    expect(result.current).toBeTypeOf('number')
    const timestamp = result.current

    await rerender()
    await rerender()
    expect(result.current).toBe(timestamp)
  })

  it('supports initialValue (upstream: initialValue option)', async () => {
    let value = 0
    const { result, rerender } = await renderHook(() => useLastChanged(value, { initialValue: 1704709379457 }))

    expect(result.current).toBe(1704709379457)

    value = 1
    await rerender()
    expect(result.current).toBeGreaterThan(1704709379457)
  })

  it('narrows the return to a number with a numeric initialValue', async () => {
    let value = 0
    const { result, rerender } = await renderHook(() => useLastChanged(value, { initialValue: 5 }))

    expect(result.current).toBe(5)

    value = 1
    await rerender()
    expect(result.current).toBeGreaterThan(5)
  })

  it('records changes involving null and undefined tracked values', async () => {
    let value: string | null | undefined
    const { result, rerender } = await renderHook(() => useLastChanged(value))

    expect(result.current).toBe(null)

    // undefined → null is a change (Object.is comparison)
    value = null
    await rerender()
    expect(result.current).toBeTypeOf('number')
    const first = result.current

    // null → undefined is a change too
    value = undefined
    await rerender()
    expect(result.current).toBeGreaterThanOrEqual(first as number)
  })

  it('re-evaluates any tracked value on every render (reactivity)', async () => {
    let value = 'a'
    const { result, rerender } = await renderHook(() => useLastChanged(value))

    expect(result.current).toBe(null)

    value = 'b'
    await rerender()
    expect(result.current).toBeTypeOf('number')
  })
})

describe('useLastChanged (component)', () => {
  function LastChangedDemo() {
    const [value, setValue] = useState(0)
    const lastChanged = useLastChanged(value)

    return (
      <div>
        <p>
          {'Last changed: '}
          {lastChanged === null ? 'never' : lastChanged}
        </p>
        <button onClick={() => setValue(v => v + 1)}>Change value</button>
        <button onClick={() => setValue(2)}>Set same value</button>
      </div>
    )
  }

  function readTimestamp(screen: { getByText: (text: string | RegExp) => { element: () => Element } }) {
    const text = screen.getByText(/Last changed: \d+/).element().textContent
    return Number(text?.match(/\d+/)?.[0])
  }

  it('renders the last-changed timestamp reactively', async () => {
    const screen = await render(<LastChangedDemo />)

    await expect.element(screen.getByText('Last changed: never')).toBeVisible()

    // a change records the timestamp of the change
    await screen.getByRole('button', { name: 'Change value' }).click()
    await expect.element(screen.getByText(/Last changed: \d+/)).toBeVisible()
    // the timestamp read is synchronous, so wait for the change to render
    await expect.poll(() => readTimestamp(screen)).toBeGreaterThan(0)
    const first = readTimestamp(screen)

    // another change records a newer timestamp
    await screen.getByRole('button', { name: 'Change value' }).click()
    await expect.poll(() => readTimestamp(screen)).toBeGreaterThan(first)
    const second = readTimestamp(screen)

    // an unchanged value keeps the timestamp
    await screen.getByRole('button', { name: 'Set same value' }).click()
    expect(readTimestamp(screen)).toBe(second)
  })
})
