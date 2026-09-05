---
category: Shared
---

# useToString

Reactively convert a value to a string — React port of VueUse's
[`useToString`](https://vueuse.org/shared/useToString/).

**Mapping:** VueUse returns a `computed(() => \`${toValue(value)}\`)`. In React the
source is already the current value (no ref to unwrap), so `useToString`returns a
plain derived string recomputed on every render — the conversion is cheap, so no
state or`useMemo`is needed and there is no stale-memo risk. A function source is
treated as a getter and invoked, mirroring VueUse's`MaybeRefOrGetter` semantics.

## Usage

```tsx
import { useToString } from '@reaxuse/shared'
import { useState } from 'react'

const [number, setNumber] = useState(3.14)
const str = useToString(number)

str // '3.14'

setNumber(2.5)
str // '2.5'
```

### Getter source

Pass a getter function to derive the string from other state on every render:

```tsx
const str = useToString(() => `value: ${count}`)
```

<DemoContainer name="UseToString" />

## Type Declarations

```ts
export function useToString(source: unknown): string
```

## Source

- VueUse: [`packages/shared/useToString`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useToString)
- reaxuse: [`packages/shared/src/useToString.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useToString.ts)

<Contributors name="useToString" />
