import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useLastChanged } from './useLastChanged'

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

  it('records the Date.now() timestamp at the moment of the change', async () => {
    let value = 0
    const { result, rerender } = await renderHook(() => useLastChanged(value))

    const before = Date.now()
    value = 1
    await rerender()
    const after = Date.now()

    expect(result.current).toBeTypeOf('number')
    expect(result.current).toBeGreaterThanOrEqual(before)
    expect(result.current).toBeLessThanOrEqual(after)
  })

  it('records a new timestamp on every change', async () => {
    let value = 0
    const { result, rerender } = await renderHook(() => useLastChanged(value))

    const firstBefore = Date.now()
    value = 1
    await rerender()
    expect(result.current).toBeGreaterThanOrEqual(firstBefore)

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

  it('re-evaluates any tracked value on every render (reactivity)', async () => {
    let value = 'a'
    const { result, rerender } = await renderHook(() => useLastChanged(value))

    expect(result.current).toBe(null)

    const before = Date.now()
    value = 'b'
    await rerender()
    expect(result.current).toBeGreaterThanOrEqual(before)
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
    const before = Date.now()
    await screen.getByRole('button', { name: 'Change value' }).click()
    await expect.element(screen.getByText(/Last changed: \d+/)).toBeVisible()
    const first = readTimestamp(screen)
    expect(first).toBeGreaterThanOrEqual(before)
    expect(first).toBeLessThanOrEqual(Date.now())

    // another change records the new timestamp
    await screen.getByRole('button', { name: 'Change value' }).click()
    const second = readTimestamp(screen)
    expect(second).toBeGreaterThanOrEqual(first)

    // an unchanged value keeps the timestamp
    await screen.getByRole('button', { name: 'Set same value' }).click()
    expect(readTimestamp(screen)).toBe(second)
  })
})
