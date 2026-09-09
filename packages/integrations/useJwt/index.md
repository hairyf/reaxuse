---
category: '@Integrations'
---

# useJwt

Wrapper for [`jwt-decode`](https://github.com/auth0/jwt-decode)

## Install

```bash
npm i jwt-decode@^4
```

## Usage

```tsx
import { useJwt } from '@reaxuse/integrations'

const encodedJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.L8i6g3PfcHlioHCCPURC9pmXT7gdJpx3kOoyAfNUwCc'
const { header, payload } = useJwt(encodedJwt)
```

or passing a ref-like object to it, the returned values will change along with the source's changes.

```tsx
import { useJwt } from '@reaxuse/integrations'

const encodedJwt = { current: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.L8i6g3PfcHlioHCCPURC9pmXT7gdJpx3kOoyAfNUwCc' }
const { header, payload } = useJwt(encodedJwt)
encodedJwt.current = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImZvbyI6ImJhciJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJmb28iOiJiYXIifQ.S5QwvREUfgEdpB1ljG_xN6NI3HubQ79xx6J1J4dsJmg'
// header / payload re-decoded on the next render
```

Custom header/payload fields via the generic parameters:

```tsx
import type { JwtHeader, JwtPayload } from 'jwt-decode'
import { useJwt } from '@reaxuse/integrations'

interface CustomJwtHeader extends JwtHeader {
  foo: string
}

interface CustomJwtPayload extends JwtPayload {
  foo: string
}

const { header, payload } = useJwt<CustomJwtPayload, CustomJwtHeader>(encodedJwt)
header.foo // 'bar'
```

Fallback value and error callback:

```tsx
import { useJwt } from '@reaxuse/integrations'

const { header, payload } = useJwt(encodedJwt, {
  fallbackValue: null,
  onError: error => console.error(error),
})
```
