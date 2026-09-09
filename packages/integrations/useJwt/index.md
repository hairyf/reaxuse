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

### Value source

`encodedJwt` is the hook's **read-only value source** and takes a plain string (upstream:
`MaybeRefOrGetter<string>`). The decode is memoized on the token, so a stable token keeps
`header`/`payload` referentially stable; a changed token re-decodes on the next render:

```tsx
const [jwt, setJwt] = useState(encodedJwt)
const { header, payload } = useJwt(jwt) // setJwt(next) re-decodes on the next render
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
