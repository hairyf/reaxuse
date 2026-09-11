---
category: Utilities
---

# Shared Utils

Framework-agnostic helper functions ported 1:1 from VueUse's internal [`@vueuse/shared`](https://vueuse.org/shared/) utils group (`is.ts` / `general.ts`) — plain TypeScript with no React state, re-exported from the `@reause/shared` package entry.

## Usage

```ts
import { clamp, isClient, promiseTimeout, toArray } from '@reause/shared'

const limited = clamp(15, 0, 10) // 10

await promiseTimeout(100) // resolves after 100ms

toArray('hello') // ['hello']
toArray([1, 2, 3]) // [1, 2, 3]

if (isClient) {
  // browser-only code
}
```
