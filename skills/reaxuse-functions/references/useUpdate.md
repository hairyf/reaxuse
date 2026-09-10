---
category: Animation
---

# useUpdate

A force-update hook — React port of react-use's [`useUpdate`](https://streamich.github.io/react-use/?path=/story/animation-useupdate--docs).

## Usage

```tsx
import { useUpdate } from '@reaxuse/shared'

const update = useUpdate()

update() // forces a re-render
```

## Type Declarations

```ts
/**
 * React port of react-use's `useUpdate`.
 *
 * Map from react-use `useUpdate`
 * Mapping: `useReducer` with a wrapping counter — the returned function
 * dispatches an update that forces a re-render and is stable across renders.
 *
 * @example
 * const update = useUpdate()
 * update() // forces a re-render
 */
export declare function useUpdate(): () => void
```
