import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useWatch } from './useWatch'

function WatchDemo() {
  const [count, setCount] = useState(0)
  const [log, setLog] = useState<string[]>([])

  useWatch(count, (value, oldValue) => {
    setLog(prev => [...prev, `${oldValue} → ${value}`])
  })

  return (
    <div>
      <span>
        {'Count is '}
        {count}
      </span>
      {log.length === 0
        ? <span>no events</span>
        : <ul>{log.map((entry, i) => <li key={i}>{entry}</li>)}</ul>}
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  )
}

it('useWatch does not fire on first render and fires on change with old value', async () => {
  const screen = await render(<WatchDemo />)

  await expect.element(screen.getByText('Count is 0')).toBeVisible()
  await expect.element(screen.getByText('no events')).toBeVisible()

  await screen.getByRole('button', { name: 'Increment' }).click()
  await expect.element(screen.getByText('0 → 1')).toBeVisible()

  await screen.getByRole('button', { name: 'Increment' }).click()
  await expect.element(screen.getByText('1 → 2')).toBeVisible()
  await expect.element(screen.getByText('0 → 1')).toBeVisible()
})

it('useWatch fires immediately on first render with { immediate: true }', async () => {
  function ImmediateWatchDemo() {
    const [log, setLog] = useState<string[]>([])

    useWatch('hello', (value, oldValue) => {
      setLog(prev => [...prev, `${String(oldValue)} → ${value}`])
    }, { immediate: true })

    return <span>{log.join(', ') || 'no events'}</span>
  }

  const screen = await render(<ImmediateWatchDemo />)

  await expect.element(screen.getByText('undefined → hello')).toBeVisible()
})

it('useWatch tracks old value across rerenders', async () => {
  const events: Array<[number, number | undefined]> = []

  const { rerender } = await renderHook((props: { value: number } = { value: 1 }) => {
    useWatch(props.value, (value, oldValue) => {
      events.push([value, oldValue])
    })
  }, { initialProps: { value: 1 } })

  expect(events).toEqual([])

  await rerender({ value: 2 })
  expect(events).toEqual([[2, 1]])

  await rerender({ value: 3 })
  expect(events).toEqual([[2, 1], [3, 2]])
})

it('useWatch supports array sources', async () => {
  const events: Array<[readonly number[], readonly number[] | undefined]> = []

  const { rerender } = await renderHook((props: { value: readonly number[] } = { value: [1, 2] }) => {
    useWatch(props.value, (value, oldValue) => {
      events.push([value, oldValue])
    })
  }, { initialProps: { value: [1, 2] } })

  expect(events).toEqual([])

  await rerender({ value: [1, 3] })
  expect(events).toEqual([[[1, 3], [1, 2]]])
})
