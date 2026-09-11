---
category: '@Integrations'
---

# useJwt

Wrapper for [`jwt-decode`](https://github.com/auth0/jwt-decode).

## Install

```bash
npm i jwt-decode@^4
```

## Usage

```tsx
import { useJwt } from '@reause/integrations'

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

## Type Declarations

```ts
export interface UseJwtOptions<Fallback> {
  /**
   * Value returned when encounter error on decoding
   *
   * @default null
   */
  fallbackValue?: Fallback
  /**
   * Error callback for decoding
   */
  onError?: (error: unknown) => void
}
/**
 * React return type: a plain object with two distinct-typed named fields —
 * the value analog of the upstream `ComputedRef`s. `header` and `payload` are
 * decoded values (or `Fallback`), NOT refs.
 */
export interface UseJwtReturn<Payload, Header, Fallback> {
  header: Header | Fallback
  payload: Payload | Fallback
}
/**
 * React port of VueUse's `useJwt`.
 *
 * Map from @vueuse/integrations `useJwt`
 * (`source/vueuse/packages/integrations/useJwt/`), a wrapper for
 * [`jwt-decode`](https://github.com/auth0/jwt-decode). `encodedJwt` is the
 * hook's **read-only value source** and takes a plain string (upstream:
 * `MaybeRefOrGetter<string>`); the decode is memoized on the token, so a
 * stable token keeps `header`/`payload` referentially stable across renders.
 *
 * Adjustment for React:
 * - upstream returns `{ header, payload }` as `ComputedRef`s; here the two
 *   fields are plain decoded values (the issue's own `const { header, payload }
 *   = useJwt(encodedJwt)` shape), so read them directly instead of `.value`;
 * - `fallbackValue` defaults to `null`, and `onError` is kept in a ref so an
 *   inline arrow callback does not churn the memo dependencies;
 * - decoding happens during render, so under React StrictMode's dev
 *   double-render a bad token may invoke `onError` twice. This is unavoidable
 *   while decoding during render; guard the callback if it must fire once.
 *
 * @__NO_SIDE_EFFECTS__
 * @see https://vueuse.org/useJwt
 * @example
 * const { header, payload } = useJwt(encodedJwt)
 * header.alg // 'HS256'
 * payload.sub // '1234567890'
 */
export declare function useJwt<
  Payload extends object = JwtPayload,
  Header extends object = JwtHeader,
  Fallback = null,
>(
  encodedJwt: string,
  options?: UseJwtOptions<Fallback>,
): UseJwtReturn<Payload, Header, Fallback>
```
