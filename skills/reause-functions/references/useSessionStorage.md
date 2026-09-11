---
category: State
---

# useSessionStorage

Reactive [SessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).

## Usage

Please refer to `useStorage`.

```tsx
import { useSessionStorage } from '@reause/core'

const [state, setState] = useSessionStorage('my-store', { hello: 'hi', greeting: 'Hello' })
const [flag, setFlag] = useSessionStorage('my-flag', true)

setState(null) // delete data from storage
```

## Type Declarations

```ts
export declare function useSessionStorage(
  key: string,
  initialValue: string,
  options?: UseStorageOptions<string>,
): UseStorageReturn<string>
export declare function useSessionStorage(
  key: string,
  initialValue: boolean,
  options?: UseStorageOptions<boolean>,
): UseStorageReturn<boolean>
export declare function useSessionStorage(
  key: string,
  initialValue: number,
  options?: UseStorageOptions<number>,
): UseStorageReturn<number>
export declare function useSessionStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options?: UseStorageOptions<T>,
): UseStorageReturn<T>
export declare function useSessionStorage<T = unknown>(
  key: string,
  initialValue: null,
  options?: UseStorageOptions<T>,
): UseStorageReturn<T>
```
