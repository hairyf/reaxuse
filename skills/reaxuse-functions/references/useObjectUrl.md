---
category: Browser
---

# useObjectUrl

Reactive URL representing an object.

## Usage

```tsx
import type { ChangeEvent } from 'react'
import { useObjectUrl } from '@reaxuse/core'
import { useState } from 'react'

const [file, setFile] = useState<File>()
const url = useObjectUrl(file)

function onFileChange(event: ChangeEvent<HTMLInputElement>) {
  const files = event.target.files
  setFile(files && files.length > 0 ? files[0] : undefined)
}
```

```tsx
return (
  <>
    <input type="file" onChange={onFileChange} />

    <a href={url}>Open file</a>
  </>
)
```

Reactive updates need no wrapper in React — pass state directly; whenever the object
changes, the previous URL is revoked and a new one is created:

```tsx
const [file, setFile] = useState<File>()
const url = useObjectUrl(file) // `undefined` until a file is set
```

## Source Forms

`object` is a read-only value source and takes a plain `Blob | MediaSource | null | undefined`
(upstream: `MaybeRefOrGetter<...>`). Resolve a React ref or state value at the call site:

```tsx
const [file, setFile] = useState<File>()

const url = useObjectUrl(file) // a new URL is created whenever `file` changes
const refUrl = useObjectUrl(fileRef.current) // resolve a React ref at the call site
```

## Type Declarations

```ts
/**
 * React port of VueUse's `useObjectUrl`.
 *
 * Map from @vueuse/core `useObjectUrl`
 * (`source/vueuse/packages/core/useObjectUrl/`). Reactive URL representing an
 * object — creates a URL for the provided `File`, `Blob`, or `MediaSource`
 * via [URL.createObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)
 * and automatically releases it via
 * [URL.revokeObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL)
 * when the source changes or the component unmounts.
 *
 * React divergences:
 * - upstream's `shallowRef` behind a `shallowReadonly` becomes a plain
 *   `string | undefined` value — this hook is purely derived, with no
 *   setters, so passing the object directly (React state) is the recommended
 *   usage;
 * - upstream watches its `MaybeRefOrGetter` source with a Vue watcher and
 *   releases the URL on every change; here `object` is a read-only value
 *   source and takes a plain `Blob | MediaSource | null | undefined`
 *   (resolve a React ref or getter at the call site), and a `useEffect` keyed
 *   on that object creates
 *   the new URL and revokes the previous one, so
 *   the URL re-creates whenever the component re-renders with a new object;
 * - unmount revocation happens in the effect cleanup (upstream:
 *   `tryOnScopeDispose`);
 * - SSR-safe: the URL is only ever created inside an effect (effects don't
 *   run on the server), and the effect bails out when `URL.createObjectURL`
 *   is unavailable.
 *
 * @see https://vueuse.org/core/useObjectUrl
 *
 * @example
 * const [file, setFile] = useState<File>()
 * const url = useObjectUrl(file)
 * // `url` is `undefined` until a file is set; a new `blob:` URL is created
 * // and the previous one revoked whenever `file` changes or the component
 * // unmounts
 */
export declare function useObjectUrl(
  object: Blob | MediaSource | null | undefined,
): string | undefined
```
