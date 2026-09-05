---
category: State
---

# useMount

A mount state flag — React port of hairylib's [`useMounted`](https://github.com/hairyf/hairylib/blob/main/packages/react/src/hooks/use-mounted.ts).
Returns a `boolean` that is `true` once the component has mounted.

**Mapping:** react-use's `useMount` runs a callback once on mount via `useEffectOnce`;
hairylib's `useMounted` instead returns a `boolean` mounted state. This port follows
hairylib semantics — `useState(false)` tracks the flag and an empty `useEffect` flips
it to `true` after the first render.

## Usage

```tsx
import { useMount } from '@reaxuse/shared'

const mounted = useMount()

// `false` on the first render, `true` after mount
```

<DemoContainer name="UseMount" />

## Type Declarations

```ts
export function useMount(): boolean
```

## Source

- react-use: [`useMount`](https://streamich.github.io/react-use/?path=/story/lifecycle-usemount--docs)
- hairylib: [`useMounted`](https://github.com/hairyf/hairylib/blob/main/packages/react/src/hooks/use-mounted.ts)
- reaxuse: [`packages/shared/src/useMount.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useMount.ts)

<Contributors name="useMount" />
