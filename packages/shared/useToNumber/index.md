---
category: Utilities
---

# useToNumber

Convert a string or number value to a number — React port of VueUse's
[`useToNumber`](https://vueuse.org/shared/useToNumber/).

**Mapping:** `ComputedRef<number>` → plain number recomputed from the current
value on every render (accepts `number | string`); no hook state needed.

## Usage

```tsx
import { useToNumber } from '@reaxuse/shared'

const number = useToNumber('123')
const int = useToNumber('123.456', { method: 'parseInt' })

number // 123
int // 123
```

<DemoContainer name="UseToNumber" />

## Type Declarations

```ts
export interface UseToNumberOptions {
  /**
   * Method to use to convert the value to a number.
   *
   * Or a custom function for the conversion.
   *
   * @default 'parseFloat'
   */
  method?: 'parseFloat' | 'parseInt' | ((value: string | number) => number)
  /**
   * The base in mathematical numeral systems passed to `parseInt`.
   * Only works with `method: 'parseInt'`
   */
  radix?: number
  /**
   * Replace NaN with zero
   *
   * @default false
   */
  nanToZero?: boolean
}

export function useToNumber(
  value: number | string,
  options?: UseToNumberOptions,
): number
```

## Source

- VueUse: [`packages/shared/useToNumber`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useToNumber)
- VueUse source: [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useToNumber/index.ts)
- VueUse tests: [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useToNumber/index.test.ts)
- reaxuse: [`packages/shared/src/useToNumber.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useToNumber.ts)

<Contributors name="useToNumber" />
