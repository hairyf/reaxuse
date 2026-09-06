---
category: Utilities
---

# useStepper

Multi-step wizard helpers — React port of VueUse's [`useStepper`](https://vueuse.org/core/useStepper/).

**Mapping:** the array form (`T extends string | number`) is ported 1:1 — step names are the steps
themselves. Only `index` is stateful (`useState`); `current`, `next`, `previous`, `isFirst`,
`isLast` and `stepNames` are plain values recomputed from the latest `steps` on each render
(upstream: refs + computed), and every function (`goTo`, `goToNext`, `goToPrevious`, `goBackTo`,
`at`, `get`, `isNext`, `isPrevious`, `isCurrent`, `isBefore`, `isAfter`) is a stable callback.
Boundary semantics are upstream's: `goToNext`/`goToPrevious` are no-ops at the last/first step (no
wrapping), `goTo` ignores unknown steps and `goBackTo` only moves backwards.

## Usage

```tsx
import { useStepper } from '@reaxuse/core'

const { steps, index, current, next, previous, goTo, isFirst, isLast }
  = useStepper(['billing-address', 'terms', 'payment'])

console.log(current) // 'billing-address'
// note: current/index are plain values (no `.value`); goTo/next/previous are stable callbacks
```

<DemoContainer name="UseStepper" />

## Type Declarations

```ts
export interface UseStepperReturn<StepName, Steps, Step> {
  steps: Steps
  stepNames: StepName[]
  index: number
  current: Step
  next: StepName | undefined
  previous: StepName | undefined
  isFirst: boolean
  isLast: boolean
  at: (index: number) => Step | undefined
  get: (step: StepName) => Step | undefined
  goTo: (step: StepName) => void
  goToNext: () => void
  goToPrevious: () => void
  goBackTo: (step: StepName) => void
  isNext: (step: StepName) => boolean
  isPrevious: (step: StepName) => boolean
  isCurrent: (step: StepName) => boolean
  isBefore: (step: StepName) => boolean
  isAfter: (step: StepName) => boolean
}

export function useStepper<T extends string | number>(steps: T[], initialStep?: T): UseStepperReturn<T, T[], T>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useStepper/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStepper/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStepper/index.browser.test.ts) (mirrored by `useStepper.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useStepper/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useStepper.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useStepper.ts), docs + demo co-located in `packages/core/useStepper/`

<Contributors name="useStepper" />
