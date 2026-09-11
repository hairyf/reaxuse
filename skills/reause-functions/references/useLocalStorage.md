---
category: State
---

# useLocalStorage

Reactive [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

## Usage

Please refer to `useStorage`.

```tsx
import { useLocalStorage } from '@reause/core'

const [state, setState] = useLocalStorage('my-store', { hello: 'hi', greeting: 'Hello' })
const [flag, setFlag] = useLocalStorage('my-flag', true)

setState(null) // delete data from storage
```

## Type Declarations

```ts
export declare function useLocalStorage(
  key: string,
  initialValue: string,
  options?: UseStorageOptions<string>,
): UseStorageReturn<string>
export declare function useLocalStorage(
  key: string,
  initialValue: boolean,
  options?: UseStorageOptions<boolean>,
): UseStorageReturn<boolean>
export declare function useLocalStorage(
  key: string,
  initialValue: number,
  options?: UseStorageOptions<number>,
): UseStorageReturn<number>
export declare function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  options?: UseStorageOptions<T>,
): UseStorageReturn<T>
export declare function useLocalStorage<T = unknown>(
  key: string,
  initialValue: null,
  options?: UseStorageOptions<T>,
): UseStorageReturn<T>
```
