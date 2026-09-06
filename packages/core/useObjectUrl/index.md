---
category: Browser
---

# useObjectUrl

Reactive URL representing an object.

Creates a URL for the provided `File`, `Blob`, or `MediaSource` via [URL.createObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) and automatically releases it via [URL.revokeObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL) when the source changes or the component is unmounted.

**Mapping:** upstream's readonly `shallowRef` return becomes a plain `string | undefined`
value — `useObjectUrl` is purely derived, with no setters. The object is resolved during
render (`toValue`, so a plain value, a `{ current }` ref-like object or a getter all work)
and a `useEffect` keyed on the resolved value creates the new URL and revokes the previous
one; the unmount revocation lives in the effect cleanup (upstream `tryOnScopeDispose`).
Nothing touches `URL` during render, so the hook is SSR-safe. The upstream component
variant (`UseObjectUrl`) is a Vue component and is not ported to React.

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

<DemoContainer name="UseObjectUrl" />

## Type Declarations

```ts
export function useObjectUrl(
  object: MaybeRefOrGetter<Blob | MediaSource | null | undefined>,
): string | undefined
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useObjectUrl/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useObjectUrl/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useObjectUrl/demo.vue) (ported to `demo.tsx` below);
  upstream ships no tests — the cases in `packages/core/src/useObjectUrl.test.tsx` are self-authored
  (URL creation, revoke + re-create on change, unmount revoke, SSR safety)
- reaxuse: [`packages/core/src/useObjectUrl.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useObjectUrl.ts), docs + demo co-located in `packages/core/useObjectUrl/`

<Contributors name="useObjectUrl" />
