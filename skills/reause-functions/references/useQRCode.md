---
category: '@Integrations'
---

# useQRCode

Wrapper for [`qrcode`](https://github.com/soldair/node-qrcode).

## Install

```bash
npm i qrcode@^1
```

## Usage

```tsx
import { useQRCode } from '@reause/integrations'

// `qrcode` is the data URL, `''` until the first encode resolves
const qrcode = useQRCode('text-to-encode')
```

### Value source

`text` is the hook's **read-only value source** and takes a plain string (upstream:
`MaybeRefOrGetter<string>`). A changed `text` prop re-encodes on the next render:

```tsx
const [text, setText] = useState('text-to-encode')
const qrcode = useQRCode(text) // setText(next) re-encodes on the next render
```

```tsx
<>
  <input type="text" value={text} onChange={event => setText(event.target.value)} />
  <img src={qrcode} alt="QR Code" />
</>
```

## Type Declarations

```ts
/**
 * React port of VueUse's `useQRCode`.
 *
 * Map from @vueuse/integrations `useQRCode`
 * (`source/vueuse/packages/integrations/useQRCode/`), a reactive wrapper
 * around the `qrcode` package: it encodes `text` into a PNG data URL.
 *
 * Adjustment for React:
 * - upstream returns a `shallowRef<string>` holding the data URL; in React the
 *   asynchronous result is state, so the hook returns the plain `string` data
 *   URL directly (no `.value`, no tuple) — `''` until the first encode
 *   resolves. Exactly like upstream, an empty `text` never encodes, so the
 *   previous data URL is kept (it is not cleared);
 * - `text` is the hook's **read-only value source** and takes a plain string
 *   (upstream: `MaybeRefOrGetter<string>`); a changed `text` prop re-encodes
 *   on the next render;
 * - the encode is `await`-free but guarded by a `cancelled` flag: when `text`
 *   (or `options`) changes or the component unmounts while an encode is still
 *   pending, the stale promise is ignored, so the last write always wins;
 * - **pass a memoized `options` object** (`useMemo`/module constant). React has
 *   no dependency-tracking equivalent of Vue's `watch` source, so `options` is
 *   compared by identity: a fresh literal on every render re-runs the effect
 *   and re-encodes the QR code. Options are deliberately not serialized — they
 *   may contain non-JSON values (`toSJISFunc`, `color` functions…), which
 *   serialization would break.
 *
 * @__NO_SIDE_EFFECTS__
 * @see https://vueuse.org/useQRCode
 * @param text - the text to encode (plain string)
 * @param options - `qrcode` `toDataURL` options, memoized by the caller
 * @example
 * const qrcode = useQRCode('https://vueuse.org')
 * qrcode // '' at first, then 'data:image/png;base64,…'
 */
export declare function useQRCode(
  text: string,
  options?: QRCode.QRCodeToDataURLOptions,
): string
```
