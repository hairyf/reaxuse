---
category: Utilities
---

# useToNumber

Convert a string or number value to a number

## Usage

```tsx
import { useToNumber } from '@reause/shared'

const number = useToNumber('123')
const int = useToNumber('123.456', { method: 'parseInt' })

number // 123
int // 123
```

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
  method?: "parseFloat" | "parseInt" | ((value: string | number) => number)
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
/**
 * React port of VueUse's `useToNumber`.
 *
 * Map from @vueuse/shared `useToNumber`
 * Mapping: `ComputedRef<number>` → plain number recomputed from the current
 * value on every render (accepts `number | string`); no hook state needed.
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * useToNumber('123') // 123
 * useToNumber('0xFA', { method: 'parseInt', radix: 16 }) // 250
 */
export declare function useToNumber(
  value: number | string,
  options?: UseToNumberOptions,
): number
```
