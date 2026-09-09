# useControllableState

A hook for combining controlled and uncontrolled state sources.

```tsx
const [value, setValue] = useControllableState(props.value, {
  defaultValue: 'initial',
  passive: true,
})
```

- Tuple and `{ value }` sources are controlled and setters write through to their setter/`onChange`.
- With `passive: true`, plain values, refs, and getters are treated as uncontrolled: the hook initializes from the source and local updates persist.
- `defaultValue` accepts a value or lazy initializer.
- `setValue` supports both values and updater functions.
- `shouldUpdate(prev, next)` returns `true` when the value should be committed; unchanged values are ignored.

`toValue` resolution is applied on every render, so lazy getters, refs, tuples, and value objects are supported consistently.

## API

```ts
interface UseControllableStateOptions<T> {
  defaultValue?: T | (() => T)
  shouldUpdate?: (prev: T, next: T) => boolean
  passive?: boolean
}
```
