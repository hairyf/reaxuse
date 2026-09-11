---
category: Lifecycle
---

# useUnmount

Runs a callback when the component unmounts — React port of react-use's [`useUnmount`](https://streamich.github.io/react-use/?path=/story/lifecycle-useunmount--docs).

## Usage

```tsx
import { useUnmount } from '@reause/shared'

useUnmount(() => cleanup())
```

## Type Declarations

```ts
/**
 * React port of react-use's `useUnmount`.
 *
 * Map from react-use `useUnmount`
 * Mapping: react-use's `useUnmount` keeps the callback in a `useRef`,
 * reassigning it on every render so the newest callback is invoked, and runs
 * it via an empty-dependency `useEffect` cleanup (react-use's `useEffectOnce`
 * is just `useEffect(effect, [])`). This port follows the same semantics.
 *
 * @example
 * useUnmount(() => cleanup())
 */
export declare function useUnmount(fn: () => any): void
```
