---
category: Browser
---

# useMemory

Reactive Memory Info — React port of VueUse's [`useMemory`](https://vueuse.org/core/useMemory/).

**Mapping:** upstream reads Chromium's non-standard `performance.memory` on every scheduler tick
(`useIntervalFn`, 1000 ms by default) → `useState` + a mount effect reading it once, then a
scheduler-driven poll refreshing the state. `isSupported` (upstream `useSupported`) and
`memory` (upstream `ShallowRef<MemoryInfo | undefined>`) both become plain React state; the
scheduler option is composed during render (Rules of Hooks).

## Usage

```tsx
import { useMemory } from '@reaxuse/core'

const { isSupported, memory } = useMemory()
```

<DemoContainer name="UseMemory" />

## Type Declarations

```ts
export interface MemoryInfo {
  readonly jsHeapSizeLimit: number
  readonly totalJSHeapSize: number
  readonly usedJSHeapSize: number
  [Symbol.toStringTag]: 'MemoryInfo'
}

export interface UseMemoryOptions {
  scheduler?: (cb: () => void) => Pausable
}

export interface UseMemoryReturn {
  isSupported: boolean
  memory: MemoryInfo | undefined
}

export function useMemory(options?: UseMemoryOptions): UseMemoryReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useMemory/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMemory/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMemory/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useMemory.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useMemory.ts), docs + demo co-located in `packages/core/useMemory/`

<Contributors name="useMemory" />
