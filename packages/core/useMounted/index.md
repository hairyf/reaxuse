---
category: Component
---

# useMounted

Mounted state in ref — React port of VueUse's [`useMounted`](https://vueuse.org/core/useMounted/).

**Mapping:** `shallowRef(false)` + `onMounted` → `useState(false)` + a mount `useEffect` calling the
setter. The state update happens after the first render, so the value stays `false` during render
and on the server (SSR-safe), then flips to `true` once the component has mounted.

## Usage

```tsx
import { useMounted } from '@reaxuse/core'

const isMounted = useMounted() // boolean
// starts `false`, flips to `true` in a mount effect — stays `false` during SSR/hydration
```

<DemoContainer name="UseMounted" />

## Type Declarations

```ts
export function useMounted(): boolean
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useMounted/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMounted/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useMounted/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useMounted.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useMounted.ts), docs + demo co-located in `packages/core/useMounted/`

<Contributors name="useMounted" />
