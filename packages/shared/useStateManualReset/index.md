---
category: Reactivity
---

# useStateManualReset

Create a state with manual reset functionality — React port of VueUse's
[`refManualReset`](https://vueuse.org/shared/refManualReset/).

**Mapping:** `refManualReset(defaultValue)` → `useStateManualReset(defaultValue)`. Upstream returns a
writable Vue `Ref` extended with a `reset` method; per reaxuse naming rules the port is renamed to
`useStateManualReset` and returns a `[value, setValue, reset]` tuple — `setValue` is the plain
`useState` setter (value or updater form) and `reset` restores the initial value.

## Usage

```tsx
import { useStateManualReset } from '@reaxuse/shared'

const [message, setMessage, resetMessage] = useStateManualReset('default message')

setMessage('message has set')

resetMessage()

console.log(message) // 'default message'
```

> [!NOTE]
> The default value can be a plain value, a ref-like object (`{ current }`) or a getter function
> (`MaybeRefOrGetter`). Like the upstream implementation, `reset` re-reads it on every call — a
> dynamic default always resets to the latest value.

<DemoContainer name="UseStateManualReset" />

## Type Declarations

```ts
export type UseStateManualResetReturn<T> = [
  value: T,
  setValue: Dispatch<SetStateAction<T>>,
  reset: () => void,
]

export function useStateManualReset<T>(defaultValue: MaybeRefOrGetter<T>): UseStateManualResetReturn<T>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/shared/refManualReset/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/refManualReset/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/refManualReset/index.test.ts) (tests mirrored in `packages/shared/src/useStateManualReset.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/shared/refManualReset/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/shared/src/useStateManualReset.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useStateManualReset.ts), docs + demo co-located in `packages/shared/useStateManualReset/`

<Contributors name="useStateManualReset" />
