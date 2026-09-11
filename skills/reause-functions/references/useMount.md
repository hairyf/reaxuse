---
category: Lifecycle
---

# useMount

Runs a callback once after the component mounts — React port of react-use's `useMount`.

## Usage

```tsx
import { useMount } from '@reause/shared'

useMount(() => {
  console.log('mounted')
})
```

## Type Declarations

```ts
/**
 * React port of react-use's `useMount`.
 *
 * Map from react-use `useMount`.
 * Runs `fn` exactly once after the component mounts.
 *
 * @example
 * useMount(() => {
 *   trackPageView()
 * })
 */
export declare function useMount(fn: () => void): void
```
