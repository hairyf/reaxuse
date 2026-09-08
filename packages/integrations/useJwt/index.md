---
category: '@Integrations'
---

# useJwt

Wrapper for [`jwt-decode`](https://github.com/auth0/jwt-decode) — React port of VueUse's
[`useJwt`](https://vueuse.org/integrations/useJwt/).

**Mapping:** upstream returns `{ header, payload }` as `ComputedRef`s; the React port returns a plain
object holding the decoded `header`/`payload` values (read them directly, there is no `.value`).
`encodedJwt` accepts a plain string or a ref-like `{ current }` object, resolved with `toValue` from
`@reaxuse/shared`.

> **Note** — `header` and `payload` are plain decoded values, not refs. Decoding happens during
> render, so under React StrictMode's development double-render a bad token may invoke `onError`
> twice; guard the callback if it must run exactly once.

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

<DemoContainer name="useJwt" />

## Type Declarations

```ts
export interface UseJwtOptions<Fallback> {
  fallbackValue?: Fallback
  onError?: (error: unknown) => void
}

export interface UseJwtReturn<Payload, Header, Fallback> {
  header: Header | Fallback
  payload: Payload | Fallback
}

export function useJwt<
  Payload extends object = JwtPayload,
  Header extends object = JwtHeader,
  Fallback = null,
>(
  encodedJwt: RefOrValue<string>,
  options?: UseJwtOptions<Fallback>,
): UseJwtReturn<Payload, Header, Fallback>
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/integrations/useJwt/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useJwt/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useJwt/index.test.ts) (mirrored in `useJwt.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/integrations/useJwt/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/integrations/src/useJwt.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/integrations/src/useJwt.ts), docs + demo co-located in `packages/integrations/useJwt/`

<Contributors name="useJwt" />
