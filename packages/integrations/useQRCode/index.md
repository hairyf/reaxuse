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

### Value source

`text` is the hook's **read-only value source** and takes a plain string (upstream:
`MaybeRefOrGetter<string>`). A changed `text` prop re-encodes on the next render:

```tsx
const [text, setText] = useState('text-to-encode')
const qrcode = useQRCode(text) // setText(next) re-encodes on the next render
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
