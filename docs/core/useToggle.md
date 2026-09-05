---
category: State
---

# useToggle

A Boolean (or value) toggler — React port of VueUse's [`useToggle`](https://vueuse.org/shared/useToggle/).

**Mapping:** `ref(initialValue)` → `useState(initialValue)`; the returned `toggle` is a stable `useCallback`.

## Usage

```tsx
import { useToggle } from '@reaxuse/core'

const [value, toggle] = useToggle()

toggle()        // false → true
toggle()        // true → false
toggle(false)   // force to false
toggle(c => !c) // functional update
```

<DemoContainer name="UseToggle" />

## Type Declarations

```ts
export type UseToggleReturn<T extends boolean | number | string = boolean> = [
  T,
  (value?: T | ((current: T) => T)) => void,
]

export function useToggle<T extends boolean | number | string = boolean>(
  initialValue?: T,
): UseToggleReturn<T>
```

## Source

- VueUse: [`packages/shared/useToggle`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useToggle)
- reaxuse: [`packages/core/src/useToggle.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useToggle.ts)
