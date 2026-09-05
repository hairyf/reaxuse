---
category: Utilities
---

# Shared Utils

Framework-agnostic helper functions ported 1:1 from VueUse's internal
[`@vueuse/shared`](https://vueuse.org/shared/) utils group (`is.ts` /
`general.ts`) — plain TypeScript with no React state, re-exported from the
`@reaxuse/shared` package entry.

**Mapping:** pure utilities stay plain functions with upstream names,
signatures and semantics. Vue-only pieces are intentionally not ported:
reactivity helpers (`toValue`, `toRef`, …), event filters
(`createFilterWrapper`, `debounceFilter`, `throttleFilter` — reaxuse hooks
inline their own) and Vue types (`MaybeRef`, … — reaxuse hooks define local
types).

## Usage

```ts
import { clamp, isClient, promiseTimeout, toArray } from '@reaxuse/shared'

const limited = clamp(15, 0, 10) // 10

await promiseTimeout(100) // resolves after 100ms

toArray('hello') // ['hello']
toArray([1, 2, 3]) // [1, 2, 3]

if (isClient) {
  // browser-only code
}
```

## Type Declarations

```ts
export declare const isClient: boolean
export declare const isDef: <T = any>(val?: T) => val is T
export declare const isObject: (val: any) => val is object
export declare const isIOS: boolean
export declare const now: () => number
export declare const timestamp: () => number
export declare const clamp: (n: number, min: number, max: number) => number
export declare const rand: (min: number, max: number) => number
export declare const noop: () => void
export declare const assert: (condition: boolean, ...infos: any[]) => void
export declare const hasOwn: <T extends object, K extends keyof T>(val: T, key: K) => key is K

export declare function promiseTimeout(ms: number, throwOnTimeout?: boolean, reason?: string): Promise<void>

export interface SingletonPromiseReturn<T> {
  (): Promise<T>
  /**
   * Reset current staled promise.
   * await it to have proper shutdown.
   */
  reset: () => Promise<void>
}

export declare function createSingletonPromise<T>(fn: () => Promise<T>): SingletonPromiseReturn<T>

export declare function increaseWithUnit(target: number, delta: number): number
export declare function increaseWithUnit(target: string, delta: number): string

export declare function toArray<T>(value: T | readonly T[]): readonly T[]
export declare function toArray<T>(value: T | T[]): T[]

export declare function objectPick<O extends object, T extends keyof O>(
  obj: O,
  keys: T[],
  omitUndefined?: boolean,
): Pick<O, T>

export declare function objectOmit<O extends object, T extends keyof O>(
  obj: O,
  keys: T[],
  omitUndefined?: boolean,
): Omit<O, T>

export declare const hyphenate: (str: string) => string
```

## Source

- VueUse: [`packages/shared/utils`](https://github.com/vueuse/vueuse/tree/main/packages/shared/utils)
- Upstream tests: [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/utils/index.test.ts) · [`index.server.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/utils/index.server.test.ts)
- reaxuse: [`packages/shared/src/utils.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/utils.ts)

<Contributors name="utils" />
