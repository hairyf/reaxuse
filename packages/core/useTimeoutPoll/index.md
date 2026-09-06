---
category: Utilities
---

# useTimeoutPoll

Use timeout to poll something — it triggers the callback after the last task is
done. React port of VueUse's
[`useTimeoutPoll`](https://vueuse.org/core/useTimeoutPoll/).

**Mapping:** the `useTimeoutFn` + shallow-ref composition becomes a
self-contained `setTimeout` poll chain inside `useEffect` (cleaned up on
unmount). `fn` / `interval` are plain values kept in refs, so `pause` /
`resume` stay stable and a changed `interval` re-arms the pending run while
active. `isActive` is a plain boolean. The first run happens one `interval`
after activation — pass `immediateCallback: true` to also fire the callback
immediately on (re)activation.

## Usage

```tsx
import { useTimeoutPoll } from '@reaxuse/core'
import { useState } from 'react'

const [count, setCount] = useState(0)

async function fetchData() {
  await new Promise(resolve => setTimeout(resolve, 1000))
  setCount(count => count + 1)
}

// Only trigger after last fetch is done
const { isActive, pause, resume } = useTimeoutPoll(fetchData, 1000)
```

<DemoContainer name="UseTimeoutPoll" />

## Type Declarations

```ts
export interface UseTimeoutPollOptions {
  /**
   * Start the timer immediately
   *
   * @default true
   */
  immediate?: boolean
  /**
   * Execute the callback immediately after calling `resume`
   *
   * @default false
   */
  immediateCallback?: boolean
}

export interface Pausable {
  isActive: boolean
  pause: () => void
  resume: () => void
}

export function useTimeoutPoll(fn: () => Awaitable<void>, interval: number, options?: UseTimeoutPollOptions): Pausable
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useTimeoutPoll/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTimeoutPoll/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTimeoutPoll/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useTimeoutPoll.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useTimeoutPoll.ts), docs + demo co-located in `packages/core/useTimeoutPoll/`

<Contributors name="useTimeoutPoll" />
