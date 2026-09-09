---
category: State
---

# useStorage

Reactive [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)/[SessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)

## Usage

```tsx
import { useStorage } from '@reaxuse/core'

const [state, setState] = useStorage('my-store', { hello: 'hi', greeting: 'Hello' })
const [flag, setFlag] = useStorage('my-flag', true)
const [id, setId] = useStorage('my-id', 'some-string-id', sessionStorage)

setState(null) // delete data from storage
```

## Merge Defaults

By default, `useStorage` will use the value from storage if it is present and ignores the default value. Be aware that when you are adding more properties to the default value, the key might be `undefined` if client's storage does not have that key.

```tsx
import { useStorage } from '@reaxuse/core'
// ---cut---
localStorage.setItem('my-store', '{"hello": "hello"}')

const [state, setState] = useStorage('my-store', { hello: 'hi', greeting: 'hello' }, localStorage)

console.log(state.greeting) // undefined, since the value is not presented in storage
```

To solve that, you can enable `mergeDefaults` option.

```tsx
import { useStorage } from '@reaxuse/core'
// ---cut---
localStorage.setItem('my-store', '{"hello": "nihao"}')

const [state, setState] = useStorage(
  'my-store',
  { hello: 'hi', greeting: 'hello' },
  localStorage,
  { mergeDefaults: true }, // <--
)

console.log(state.hello) // 'nihao', from storage
console.log(state.greeting) // 'hello', from merged default value
```

When setting it to true, it will perform a **shallow merge** for objects. You can pass a function to perform custom merge (e.g. deep merge), for example:

```tsx
import { useStorage } from '@reaxuse/core'
// ---cut---
const [state, setState] = useStorage(
  'my-store',
  { hello: 'hi', greeting: 'hello' },
  localStorage,
  { mergeDefaults: (storageValue, defaults) => deepMerge(defaults, storageValue) }, // <--
)
```

## Custom Serialization

By default, `useStorage` will smartly use the corresponding serializer based on the data type of provided default value. For example, `JSON.stringify` / `JSON.parse` will be used for objects, `Number.toString` / `parseFloat` for numbers, etc.

You can also provide your own serialization function to `useStorage`:

```tsx
import { useStorage } from '@reaxuse/core'

useStorage(
  'key',
  {},
  undefined,
  {
    serializer: {
      read: (v: any) => v ? JSON.parse(v) : null,
      write: (v: any) => JSON.stringify(v),
    },
  },
)
```

Please note when you provide `null` as the default value, `useStorage` can't assume the data type from it. In this case, you can provide a custom serializer or reuse the built-in ones explicitly.

```tsx
import { StorageSerializers, useStorage } from '@reaxuse/core'

const [objectLike, setObjectLike] = useStorage('key', null, undefined, { serializer: StorageSerializers.object })
setObjectLike({ foo: 'bar' })
```

### Built-in Serializers

The following serializers are available via `StorageSerializers`:

| Type      | Description                           |
| --------- | ------------------------------------- |
| `string`  | Plain string                          |
| `number`  | Number (via `parseFloat`)             |
| `boolean` | Boolean                               |
| `object`  | JSON object/array                     |
| `map`     | JavaScript `Map`                      |
| `set`     | JavaScript `Set`                      |
| `date`    | JavaScript `Date` (via `toISOString`) |
| `any`     | Raw string passthrough                |

```tsx
import { StorageSerializers, useStorage } from '@reaxuse/core'

const [myMap, setMyMap] = useStorage('my-map', new Map(), undefined, {
  serializer: StorageSerializers.map,
})
```

## Options

```tsx
useStorage('key', defaults, storage, {
  // Sync across tabs via storage events (default: true)
  listenToStorageChanges: true,
  // Write default value to storage if not present (default: true)
  writeDefaults: true,
  // Custom error handler (default: console.error)
  onError: e => console.error(e),
})
```

## Reactive Key

The storage key can be derived from state — the data will be updated when the key changes between renders:

```tsx
import { useStorage } from '@reaxuse/core'
import { useState } from 'react'

const [userId, setUserId] = useState('user-1')
const userData = useStorage(
  `user-data-${userId}`,
  { name: '' },
)

// Changing the key will read from the new storage location
setUserId('user-2')
```
