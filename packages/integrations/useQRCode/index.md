---
category: '@Integrations'
---

# useQRCode

Wrapper for [`qrcode`](https://github.com/soldair/node-qrcode) — React port of VueUse's
[`useQRCode`](https://vueuse.org/integrations/useQRCode/). Encodes `text` into a PNG data URL.

**Mapping:** upstream returns a `shallowRef<string>` holding the data URL; the React port returns
the plain `string` data URL directly (no `.value`, no tuple) — `''` until the first encode
resolves. `text` accepts a plain string or a ref-like `{ current }` object, resolved with `toValue`
from `@reaxuse/shared` (upstream's `MaybeRefOrGetter`; zero-argument getters are not supported).
An empty `text` never encodes, so like upstream the previous data URL is kept rather than cleared.

## Install

```bash
npm i qrcode@^1
```

## Usage

```tsx
import { useQRCode } from '@reaxuse/integrations'

// `qrcode` is the data URL, `''` until the first encode resolves
const qrcode = useQRCode('text-to-encode')
```

or passing a ref-like object to it, the returned data URL will change along with the source's
changes (re-render with the ref after mutating `.current`):

```tsx
import { useQRCode } from '@reaxuse/integrations'

const text = { current: 'text-to-encode' }
const qrcode = useQRCode(text)
text.current = 'another-text'
// re-render → qrcode re-encodes
```

```tsx
<>
  <input type="text" value={text} onChange={event => setText(event.target.value)} />
  <img src={qrcode} alt="QR Code" />
</>
```

### Memoize `options`

React has no dependency-tracking equivalent of Vue's `watch` source, so `options` is compared by
identity: **pass a memoized object** (`useMemo` or a module-level constant). A fresh literal on
every render re-runs the effect and re-encodes the QR code.

```tsx
import { useQRCode } from '@reaxuse/integrations'
import { useMemo } from 'react'

const options = useMemo(() => ({ errorCorrectionLevel: 'H' as const, margin: 3 }), [])
const qrcode = useQRCode('text-to-encode', options)
```

`options` is deliberately not serialized for comparison: `QRCodeToDataURLOptions` may contain
non-JSON values (`toSJISFunc`, color functions…), which serialization would break. The
`cancelled` guard makes the last text/options write win, so a stale encode never overwrites a
newer one, and unmounting mid-encode does not set state.

<DemoContainer name="useQRCode" />

## Type Declarations

```ts
export function useQRCode(
  text: RefOrValue<string>,
  options?: QRCode.QRCodeToDataURLOptions,
): string
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/integrations/useQRCode/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useQRCode/index.ts) (implementation),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useQRCode/demo.vue) (ported to `demo.tsx` below),
  [`index.md`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useQRCode/index.md) (docs).
  Upstream ships **no** `index.test.ts` for `useQRCode`, so the browser tests in
  `packages/integrations/src/useQRCode.test.tsx` are self-authored (empty text, plain string,
  ref-like input, last-write-wins on text change, options forwarding, unmount mid-encode).
- reaxuse: [`packages/integrations/src/useQRCode.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/integrations/src/useQRCode.ts), docs + demo co-located in `packages/integrations/useQRCode/`

<Contributors name="useQRCode" />
