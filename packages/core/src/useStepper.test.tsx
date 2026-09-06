import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useStepper } from './useStepper'

const STRING_STEPS = ['First step', 'Second step', 'Last step']
const NUMBER_STEPS = [1, 2, 3]

it('useStepper should be defined', () => {
  expect(useStepper).toBeDefined()
})

it('useStepper starts at the first step with derived state', async () => {
  const { result } = await renderHook((props?: { steps?: string[] }) =>
    useStepper(props?.steps ?? ['billing-address', 'terms', 'payment']))

  expect(result.current.current).toBe('billing-address')
  expect(result.current.index).toBe(0)
  expect(result.current.steps).toEqual(['billing-address', 'terms', 'payment'])
  expect(result.current.stepNames).toEqual(['billing-address', 'terms', 'payment'])
  expect(result.current.isFirst).toBe(true)
  expect(result.current.isLast).toBe(false)
})

it('useStepper supports navigating through steps', async () => {
  const { result, act } = await renderHook(() => useStepper(['first', 'second', 'last']))

  expect(result.current.current).toBe('first')

  // Checks that when this is the first step, we can't go back
  await act(() => {
    result.current.goToPrevious()
  })
  expect(result.current.current).toBe('first')

  // Checks that we can simply go next
  await act(() => {
    result.current.goToNext()
  })
  expect(result.current.current).toBe('second')
  await act(() => {
    result.current.goToNext()
  })
  expect(result.current.current).toBe('last')

  // Checks that when this is the last step, we can't go next (no wrapping)
  await act(() => {
    result.current.goToNext()
  })
  expect(result.current.current).toBe('last')

  // Checks that when this is not the first step, we can go back
  await act(() => {
    result.current.goToPrevious()
  })
  expect(result.current.current).toBe('second')

  // Checks that we can go back to a previous step
  await act(() => {
    result.current.goBackTo('first')
  })
  expect(result.current.current).toBe('first')

  // Checks that we CANNOT go back to a future step
  await act(() => {
    result.current.goBackTo('last')
  })
  expect(result.current.current).toBe('first')

  // Checks that we can go to any step
  await act(() => {
    result.current.goTo('last')
  })
  expect(result.current.current).toBe('last')
})

it('useStepper can tell the step position', async () => {
  const { result, act } = await renderHook(() => useStepper(['first', 'second', 'last']))

  // First step
  expect(result.current.isFirst).toBe(true)
  expect(result.current.isLast).toBe(false)

  expect(result.current.isAfter('first')).toBe(false)
  expect(result.current.isAfter('second')).toBe(false)
  expect(result.current.isAfter('last')).toBe(false)

  expect(result.current.isBefore('first')).toBe(false)
  expect(result.current.isBefore('second')).toBe(true)
  expect(result.current.isBefore('last')).toBe(true)

  expect(result.current.isCurrent('first')).toBe(true)
  expect(result.current.isCurrent('second')).toBe(false)
  expect(result.current.isCurrent('last')).toBe(false)

  expect(result.current.isPrevious('first')).toBe(false)
  expect(result.current.isPrevious('second')).toBe(false)
  expect(result.current.isPrevious('last')).toBe(false)

  expect(result.current.isNext('first')).toBe(false)
  expect(result.current.isNext('second')).toBe(true)
  expect(result.current.isNext('last')).toBe(false)

  // Second step
  await act(() => {
    result.current.goToNext()
  })

  expect(result.current.isFirst).toBe(false)
  expect(result.current.isLast).toBe(false)

  expect(result.current.isAfter('first')).toBe(true)
  expect(result.current.isAfter('second')).toBe(false)
  expect(result.current.isAfter('last')).toBe(false)

  expect(result.current.isBefore('first')).toBe(false)
  expect(result.current.isBefore('second')).toBe(false)
  expect(result.current.isBefore('last')).toBe(true)

  expect(result.current.isCurrent('first')).toBe(false)
  expect(result.current.isCurrent('second')).toBe(true)
  expect(result.current.isCurrent('last')).toBe(false)

  expect(result.current.isPrevious('first')).toBe(true)
  expect(result.current.isPrevious('second')).toBe(false)
  expect(result.current.isPrevious('last')).toBe(false)

  expect(result.current.isNext('first')).toBe(false)
  expect(result.current.isNext('second')).toBe(false)
  expect(result.current.isNext('last')).toBe(true)

  // Last step
  await act(() => {
    result.current.goToNext()
  })

  expect(result.current.isFirst).toBe(false)
  expect(result.current.isLast).toBe(true)

  expect(result.current.isAfter('first')).toBe(true)
  expect(result.current.isAfter('second')).toBe(true)
  expect(result.current.isAfter('last')).toBe(false)

  expect(result.current.isBefore('first')).toBe(false)
  expect(result.current.isBefore('second')).toBe(false)
  expect(result.current.isBefore('last')).toBe(false)

  expect(result.current.isCurrent('first')).toBe(false)
  expect(result.current.isCurrent('second')).toBe(false)
  expect(result.current.isCurrent('last')).toBe(true)

  expect(result.current.isPrevious('first')).toBe(false)
  expect(result.current.isPrevious('second')).toBe(true)
  expect(result.current.isPrevious('last')).toBe(false)

  expect(result.current.isNext('first')).toBe(false)
  expect(result.current.isNext('second')).toBe(false)
  expect(result.current.isNext('last')).toBe(false)
})

it('useStepper does not navigate to steps that do not exist', async () => {
  // explicitly `string[]` so `goTo` accepts an unknown name (T widens to
  // `string` instead of the literal union) — upstream uses @ts-expect-error
  const steps: string[] = ['first', 'second', 'last']
  const { result, act } = await renderHook(() => useStepper(steps))

  await act(() => {
    result.current.goTo('unexisting step')
  })
  expect(result.current.current).toBe('first')

  // next/previous stay undefined-safe around the boundaries; for an unknown
  // step indexOf is -1, so upstream's isAfter is true and isBefore false
  expect(result.current.isCurrent('unexisting step')).toBe(false)
  expect(result.current.isBefore('unexisting step')).toBe(false)
  expect(result.current.isAfter('unexisting step')).toBe(true)
})

it('useStepper exposes the next and previous step names', async () => {
  const { result, act } = await renderHook((props?: { steps?: string[] }) =>
    useStepper(props?.steps ?? STRING_STEPS))

  expect(result.current.next).toBe('Second step')
  expect(result.current.previous).toBeUndefined()

  await act(() => {
    result.current.goToNext()
  })
  expect(result.current.next).toBe('Last step')
  expect(result.current.previous).toBe('First step')

  await act(() => {
    result.current.goToNext()
  })
  expect(result.current.next).toBeUndefined()
  expect(result.current.previous).toBe('Second step')
})

it('useStepper supports being initialized with a specific step', async () => {
  const { result } = await renderHook(() => useStepper(STRING_STEPS, 'Last step'))

  expect(result.current.current).toBe('Last step')
  expect(result.current.index).toBe(2)
  expect(result.current.isCurrent('Last step')).toBe(true)
  expect(result.current.isLast).toBe(true)
})

it('useStepper supports type-specific features (string steps)', async () => {
  const { result } = await renderHook(() => useStepper(STRING_STEPS))

  expect(result.current.stepNames).toEqual(['First step', 'Second step', 'Last step'])
  expect(result.current.steps).toEqual(['First step', 'Second step', 'Last step'])
})

it('useStepper works with number steps (generic)', async () => {
  const { result, act } = await renderHook(() => useStepper(NUMBER_STEPS))

  expect(result.current.current).toBe(1)
  expect(result.current.isFirst).toBe(true)

  await act(() => {
    result.current.goTo(3)
  })
  expect(result.current.current).toBe(3)
  expect(result.current.isLast).toBe(true)
  expect(result.current.next).toBeUndefined()
  expect(result.current.previous).toBe(2)
  expect(result.current.isCurrent(2)).toBe(false)
  expect(result.current.isBefore(2)).toBe(false)
  expect(result.current.isAfter(2)).toBe(true)

  // goToNext at the last step is a no-op, goToPrevious still works
  await act(() => {
    result.current.goToNext()
  })
  expect(result.current.current).toBe(3)

  await act(() => {
    result.current.goToPrevious()
  })
  expect(result.current.current).toBe(2)
})

it('useStepper can get a step at a specific index', async () => {
  const { result } = await renderHook(() => useStepper(STRING_STEPS))

  expect(result.current.at(0)).toBe('First step')
  expect(result.current.at(1)).toBe('Second step')
  expect(result.current.at(2)).toBe('Last step')
  expect(result.current.at(3)).toBeUndefined()
})

it('useStepper can get a step by its name', async () => {
  const { result } = await renderHook(() => useStepper(STRING_STEPS))

  expect(result.current.get('First step')).toBe('First step')
  expect(result.current.get('Second step')).toBe('Second step')
  expect(result.current.get('Last step')).toBe('Last step')
  expect(result.current.get('unknown')).toBeUndefined()
})

it('useStepper keeps its control callbacks stable across renders', async () => {
  const { result, act } = await renderHook(() => useStepper(STRING_STEPS))

  const first = result.current
  await act(() => {
    first.goToNext()
  })

  expect(result.current.current).toBe('Second step')
  expect(result.current.goTo).toBe(first.goTo)
  expect(result.current.goToNext).toBe(first.goToNext)
  expect(result.current.goToPrevious).toBe(first.goToPrevious)
  expect(result.current.goBackTo).toBe(first.goBackTo)
  expect(result.current.at).toBe(first.at)
  expect(result.current.get).toBe(first.get)
  expect(result.current.isNext).toBe(first.isNext)
  expect(result.current.isPrevious).toBe(first.isPrevious)
  expect(result.current.isCurrent).toBe(first.isCurrent)
  expect(result.current.isBefore).toBe(first.isBefore)
  expect(result.current.isAfter).toBe(first.isAfter)
})

it('useStepper re-derives when the steps array changes (index preserved)', async () => {
  // mirrors upstream's "steps are reactive": upstream keeps the index while
  // stepNames/current/isLast recompute from the new steps
  const { result, act, rerender } = await renderHook((props?: { steps?: string[] }) =>
    useStepper(props?.steps ?? STRING_STEPS))

  await act(() => {
    result.current.goToNext()
  })
  expect(result.current.current).toBe('Second step')

  const grown = [...STRING_STEPS, 'Extra step']
  await rerender({ steps: grown })

  expect(result.current.index).toBe(1)
  expect(result.current.stepNames).toEqual(grown)
  expect(result.current.steps).toEqual(grown)
  expect(result.current.isLast).toBe(false)
  expect(result.current.next).toBe('Last step')

  await act(() => {
    result.current.goToNext()
  })
  expect(result.current.current).toBe('Last step')
  // 'Extra step' still follows in the grown array
  expect(result.current.isLast).toBe(false)
  expect(result.current.next).toBe('Extra step')

  await act(() => {
    result.current.goToNext()
  })
  expect(result.current.current).toBe('Extra step')
  expect(result.current.isLast).toBe(true)
  expect(result.current.next).toBeUndefined()
})

function StepperDemo() {
  const { current, isFirst, isLast, goToNext, goToPrevious } = useStepper(STRING_STEPS)

  return (
    <div>
      <span>{`Current is ${current}`}</span>
      <button disabled={isFirst} onClick={goToPrevious}>Previous</button>
      <button disabled={isLast} onClick={goToNext}>Next</button>
    </div>
  )
}

it('useStepper works in a component (next → previous)', async () => {
  const screen = await render(<StepperDemo />)

  await expect.element(screen.getByText('Current is First step')).toBeVisible()
  // Previous is disabled at the first step (isFirst) — the no-op itself is
  // covered by the renderHook navigation test
  await expect.element(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()

  await screen.getByRole('button', { name: 'Next' }).click()
  await expect.element(screen.getByText('Current is Second step')).toBeVisible()

  await screen.getByRole('button', { name: 'Next' }).click()
  await expect.element(screen.getByText('Current is Last step')).toBeVisible()
  await expect.element(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

  await screen.getByRole('button', { name: 'Previous' }).click()
  await expect.element(screen.getByText('Current is Second step')).toBeVisible()
})
