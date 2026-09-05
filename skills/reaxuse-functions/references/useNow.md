# useNow

> Reactive current Date instance.

Port of VueUse's [`useNow`](https://vueuse.org/core/useNow/) to React.

## Usage

```tsx
import { useNow } from '@reaxuse/core'

function Clock() {
  const now = useNow(1000) // number — ms timestamp, updates every second
  return <time>{new Date(now).toLocaleTimeString()}</time>
}
```

## Type

```ts
function useNow(interval?: number): number
```

- `interval` is the update period in milliseconds (default `1000`).
- Returns a number (ms timestamp); `useEffect` sets a `setInterval` that
  refreshes it.

## React Notes

- Default `interval` of `1000`; pass a larger value to reduce re-renders.
