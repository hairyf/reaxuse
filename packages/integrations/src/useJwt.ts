import type { RefOrValue } from '@reaxuse/shared'
import type { JwtDecodeOptions, JwtHeader, JwtPayload } from 'jwt-decode'
import { toValue } from '@reaxuse/shared'
import { jwtDecode } from 'jwt-decode'
import { useMemo, useRef } from 'react'

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
 * [`jwt-decode`](https://github.com/auth0/jwt-decode). `encodedJwt` accepts a
 * plain string or a ref-like `{ current }` object, resolved with `toValue`
 * from `@reaxuse/shared`; the decode is memoized on the resolved token, so a
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
export function useJwt<
  Payload extends object = JwtPayload,
  Header extends object = JwtHeader,
  Fallback = null,
>(
  encodedJwt: RefOrValue<string>,
  options: UseJwtOptions<Fallback> = {},
): UseJwtReturn<Payload, Header, Fallback> {
  const {
    onError,
    fallbackValue = null,
  } = options

  // latest `onError` in a ref: an inline arrow is a new function every render
  // and would otherwise invalidate the memos below on every render
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError

  const token = toValue(encodedJwt)

  const decodeWithFallback = <T extends object>(value: string, jwtOptions?: JwtDecodeOptions): T | Fallback => {
    try {
      return jwtDecode<T>(value, jwtOptions)
    }
    catch (err) {
      onErrorRef.current?.(err)
      return fallbackValue as Fallback
    }
  }

  const header = useMemo(() => decodeWithFallback<Header>(token, { header: true }), [token, fallbackValue])
  const payload = useMemo(() => decodeWithFallback<Payload>(token), [token, fallbackValue])

  return {
    header,
    payload,
  }
}
