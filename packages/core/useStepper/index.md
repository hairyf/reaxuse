---
category: Utilities
---

# useStepper

Provides helpers for building a multi-step wizard interface.

## Usage

### Steps as array

```tsx
import { useStepper } from '@reaxuse/core'

const [index, setIndex, {
  steps,
  stepNames,
  current,
  next,
  previous,
  isFirst,
  isLast,
  goTo,
  goToNext,
  goToPrevious,
  goBackTo,
  isNext,
  isPrevious,
  isCurrent,
  isBefore,
  isAfter,
}] = useStepper([
  'billing-address',
  'terms',
  'payment',
])

// Access the step through `current`
console.log(current) // 'billing-address'
```

The return is a React tuple `[index, setIndex, controls]` — upstream returns an object whose `index` is a
writable `Ref<number>` and whose other members are readonly refs/computeds. `index` is plain state,
`setIndex` is the React setter, and `controls` exposes the remaining members as plain values and stable
callbacks (no `.value`).

### Steps as object

The object form is not ported — pass an array of steps, where step names are the steps themselves.

## Return Values

- `index` — index of the current step.
- `setIndex(next | prev => next)` — setter for the current step index.
- `controls.steps` — list of steps.
- `controls.stepNames` — list of step names.
- `controls.current` — current step.
- `controls.next` — next step, or `undefined` if the current step is the last one.
- `controls.previous` — previous step, or `undefined` if the current step is the first one.
- `controls.isFirst` — whether the current step is the first one.
- `controls.isLast` — whether the current step is the last one.
- `controls.at(index)` — get the step at the specified index.
- `controls.get(step)` — get a step by the specified name.
- `controls.goTo(step)` — go to the specified step. Does nothing if the step does not exist.
- `controls.goToNext()` — go to the next step. Does nothing if the current step is the last one.
- `controls.goToPrevious()` — go to the previous step. Does nothing if the current step is the first one.
- `controls.goBackTo(step)` — go back to the given step, only if the current step is after.
- `controls.isNext(step)` — checks whether the given step is the next step.
- `controls.isPrevious(step)` — checks whether the given step is the previous step.
- `controls.isCurrent(step)` — checks whether the given step is the current step.
- `controls.isBefore(step)` — checks if the current step is before the given step.
- `controls.isAfter(step)` — checks if the current step is after the given step.
