---
category: '@Integrations'
---

# useQRCode

Wrapper for [`qrcode`](https://github.com/soldair/node-qrcode)

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
