---
category: Reactivity
---

# useStateDefault

Apply default value to a ref — React port of VueUse's
[`refDefault`](https://vueuse.org/shared/refDefault/), renamed to
`useStateDefault` per this repo's `ref*` naming convention.

**Mapping:** upstream `refDefault(raw, 'default')` derives a writable `computed`
from a source `Ref<T | undefined | null>` — it reads `raw.value ?? defaultValue`
and writes back to `raw.value`. This port keeps the source as an
externally-controlled ref-like object (`{ current }`, e.g. the first tuple
element of `useStorage`) and returns the React tuple
`const [value, setValue] = useStateDefault(raw, 'default')`. `value` is derived
on every render from the source, so it always reflects the source's current
value (or the default while the source is `null`/`undefined`) — including
writes made from outside the component; `setValue` resolves the next value and
writes it through to the source's `current`. SSR-safe: the first render already
shows the default without any effect or DOM access.

## Usage

```tsx
import { useStateDefault } from '@reaxuse/shared'

const raw = { current: undefined as string | undefined }
const [value, setValue] = useStateDefault(raw, 'default')

setValue('hello')
console.log(value) // 'hello'
console.log(raw.current) // 'hello'

setValue(undefined)
console.log(value) // 'default'

raw.current = 'from outside' // external control — picked up on the next render
```

<DemoContainer name="UseStateDefault" />

## Type Declarations

```ts
export type UseStateDefaultReturn<T = any> = [
  value: T,
  setValue: Dispatch<SetStateAction<T | undefined | null>>,
]

export function useStateDefault<T = any>(
  source: MaybeRefOrGetter<T | undefined | null>,
  defaultValue: T,
): UseStateDefaultReturn<T>
```

## Source

- VueUse: [`packages/shared/refDefault`](https://github.com/vueuse/vueuse/tree/main/packages/shared/refDefault) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/refDefault/index.ts), docs [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/shared/refDefault/index.md)
- reaxuse: [`packages/shared/src/useStateDefault.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useStateDefault.ts)

<Contributors name="useStateDefault" />
