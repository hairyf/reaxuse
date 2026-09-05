---
category: Time
---

# useNow

Reactive current timestamp, updating every `interval` milliseconds —
React port of VueUse's [`useNow`](https://vueuse.org/core/useNow/).

**Mapping:** `ref(Date.now())` + `watch` with `setInterval` → `useState` +
`useEffect` with `setInterval`, cleaned up on unmount.

## Usage

```tsx
import { useNow } from '@reaxuse/core'

const now = useNow(1000) // updates every second
```

<DemoContainer name="UseNow" />

## Type Declarations

```ts
export function useNow(interval?: number): number
```

## Source

- VueUse: [`packages/core/useNow`](https://github.com/vueuse/vueuse/tree/main/packages/core/useNow)
- reaxuse: [`packages/core/src/useNow.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useNow.ts)
