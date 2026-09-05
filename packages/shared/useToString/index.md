---
category: Utilities
---

# useToString

Reactively convert a ref to string — React port of VueUse's [`useToString`](https://vueuse.org/shared/useToString/).

**Mapping:** VueUse wraps a template literal in `computed(() => ...)` and accepts a `MaybeRefOrGetter`;
React has no implicit reactivity, so `useToString` is a plain function that returns the stringified value directly.

## Usage

```tsx
import { useToString } from '@reaxuse/shared'

useToString(123.345) // '123.345'
useToString('hi') // 'hi'
useToString({ foo: 'hi' }) // '[object Object]'
```

<DemoContainer name="UseToString" />

## Type Declarations

```ts
export function useToString(value: unknown): string
```

## Source

- VueUse: [`packages/shared/useToString`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useToString)
- reaxuse: [`packages/shared/src/useToString.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useToString.ts)

<Contributors name="useToString" />
