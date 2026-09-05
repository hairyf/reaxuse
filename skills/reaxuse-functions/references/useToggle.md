# useToggle

> A boolean switcher with utility functions.

Port of VueUse's [`useToggle`](https://vueuse.org/core/useToggle/) to React.

## Usage

```tsx
import { useToggle } from '@reaxuse/shared'

function Example() {
  const [value, toggle] = useToggle()
  // value: boolean — toggle() flips it
  return <button onClick={() => toggle()}>{value ? 'On' : 'Off'}</button>
}
```

## Type

```ts
function useToggle(
  initialValue?: boolean,
): readonly [boolean, (value?: boolean | ((current: boolean) => boolean)) => void]
```

- The setter accepts an optional value to set, or an updater function.
- Backed by `useState` + `useCallback`.

## React Notes

- Always call at the top level of a component (Rules of Hooks).
- The updater form `toggle(v => !v)` is safe with batched state updates.
