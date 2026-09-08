---
category: Utilities
---

# isDefined

Non-nullish checking type guard for ref-like objects — React port of VueUse's [`isDefined`](https://vueuse.org/shared/isDefined/).

**Mapping:** upstream narrows a Vue `Ref` / `ComputedRef`; the React port operates on ref-like (`{ current }`) objects and narrows `.current` to `Exclude<T, null | undefined>`. A plain-value overload keeps upstream parity, so bare values can be guarded with the same call.

## Usage

```tsx
import { isDefined } from '@reaxuse/shared'
import { useRef } from 'react'

const example = useRef(Math.random() ? 'example' : undefined) // RefObject<string | undefined>

if (isDefined(example))
  example.current // string — narrowed by the type guard
```

<DemoContainer name="IsDefined" />

## Type Declarations

```ts
export type IsDefinedReturn = boolean

export function isDefined<T>(v: RefObject<T>): v is RefObject<Exclude<T, null | undefined>>
export function isDefined<T>(v: T): v is Exclude<T, null | undefined>
```

## Source

- VueUse: [`packages/shared/isDefined/index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/isDefined/index.ts) (implementation) + [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/isDefined/index.test.ts) (mirrored tests)
- reaxuse: [`packages/shared/src/isDefined.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/isDefined.ts) · tests [`packages/shared/src/isDefined.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/isDefined.test.tsx) · demo [`packages/shared/isDefined/demo.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/isDefined/demo.tsx)

<Contributors name="isDefined" />
