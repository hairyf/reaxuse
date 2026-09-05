---
category: State
---

# useUnmount

Runs a callback when the component unmounts — React port of react-use's [`useUnmount`](https://streamich.github.io/react-use/?path=/story/lifecycle-useunmount--docs).

**Mapping:** react-use keeps the callback in a `useRef`, reassigning it on every render
so the newest callback is invoked, and runs it via an empty-dependency `useEffect`
cleanup (react-use's `useEffectOnce` is just `useEffect(effect, [])`). This port
follows the same semantics.

## Usage

```tsx
import { useUnmount } from '@reaxuse/shared'

useUnmount(() => cleanup())
```

<DemoContainer name="UseUnmount" />

## Type Declarations

```ts
export function useUnmount(fn: () => any): void
```

## Source

- react-use: [`useUnmount`](https://streamich.github.io/react-use/?path=/story/lifecycle-useunmount--docs)
- react-use source: [`useUnmount.ts`](https://github.com/streamich/react-use/blob/master/src/useUnmount.ts)
- reaxuse: [`packages/shared/src/useUnmount.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useUnmount.ts)

<Contributors name="useUnmount" />
