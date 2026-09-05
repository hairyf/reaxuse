---
category: State
---

# useUpdate

A force-update hook — React port of react-use's [`useUpdate`](https://streamich.github.io/react-use/?path=/story/animation-useupdate--docs).

**Mapping:** `useReducer` with a wrapping counter — the returned `update` dispatches a state change that forces a re-render. The function is stable across renders.

## Usage

```tsx
import { useUpdate } from '@reaxuse/shared'

const update = useUpdate()

update() // forces a re-render
```

<DemoContainer name="UseUpdate" />

## Type Declarations

```ts
export function useUpdate(): () => void
```

## Source

- react-use: [`src/useUpdate.ts`](https://github.com/streamich/react-use/blob/master/src/useUpdate.ts)
- hairylib: [`packages/react/src/hooks/use-update.ts`](https://github.com/hairyf/hairylib/blob/main/packages/react/src/hooks/use-update.ts)
- reaxuse: [`packages/shared/src/useUpdate.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useUpdate.ts)

<Contributors name="useUpdate" />
