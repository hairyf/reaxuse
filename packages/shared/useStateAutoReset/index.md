---
category: Reactivity
---

# useStateAutoReset

A state which will be reset to the default value after some time — React port of VueUse's [`refAutoReset`](https://vueuse.org/shared/refAutoReset/).

**Mapping:** upstream returns a writable `Ref`; per this repo's `useState*`
family convention the return is the React `[value, setValue]` tuple. `value` is
the state, `setValue` is a `useState`-style setter (value or updater form) that
also (re)schedules a timer to restore `defaultValue` after `afterMs`
milliseconds. Both `defaultValue` and `afterMs` accept the shared
`MaybeRefOrGetter` form and are resolved with `toValue` at fire time; the
pending timer is cleared on unmount (upstream: `tryOnScopeDispose`). The
deprecated `autoResetRef` alias is not ported.

## Usage

```tsx
import { useStateAutoReset } from '@reaxuse/shared'

const [message, setMessage] = useStateAutoReset('default message', 1000)

function setMessage() {
  // here the value will change to 'message has set' but after 1000ms, it will change to 'default message'
  setMessage('message has set')
}
```

<DemoContainer name="UseStateAutoReset" />

## Type Declarations

```ts
export type UseStateAutoResetReturn<T = any> = [T, Dispatch<SetStateAction<T>>]

export function useStateAutoReset<T = any>(
  defaultValue: MaybeRefOrGetter<T>,
  afterMs?: MaybeRefOrGetter<number>,
): UseStateAutoResetReturn<T>
```

## Source

- VueUse: [`packages/shared/refAutoReset`](https://github.com/vueuse/vueuse/tree/main/packages/shared/refAutoReset)
- VueUse source: [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/refAutoReset/index.ts)
- VueUse tests: [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/refAutoReset/index.test.ts)
- VueUse demo: [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/shared/refAutoReset/demo.vue)
- reaxuse: [`packages/shared/src/useStateAutoReset.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useStateAutoReset.ts)

<Contributors name="useStateAutoReset" />
