---
category: Utilities
---

# useSupported

SSR compatibility `isSupported` — React port of VueUse's [`useSupported`](https://vueuse.org/core/useSupported/).

**Mapping:** upstream composes `useMounted` and returns a `ComputedRef` evaluating
`Boolean(callback())` once mounted → `useState(false)` + a mount `useEffect` evaluating the
callback. The Vue ref return becomes a plain boolean; the callback never runs during render or
on the server (SSR-safe), and React has no reactive dependency tracking, so the result is
evaluated exactly once on mount instead of re-evaluating on reactive changes.

## Usage

```tsx
import { useSupported } from '@reaxuse/core'

const isSupported = useSupported(() => navigator && 'getBattery' in navigator)

if (isSupported) {
  // Battery Status API is available
}
```

<DemoContainer name="UseSupported" />

## Type Declarations

```ts
export function useSupported(callback: () => unknown): boolean
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useSupported/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useSupported/index.ts) (implementation; no upstream demo or tests — the demo below is written for reaxuse)
- reaxuse: [`packages/core/src/useSupported.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useSupported.ts), docs + demo co-located in `packages/core/useSupported/`

<Contributors name="useSupported" />
