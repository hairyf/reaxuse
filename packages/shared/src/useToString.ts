/**
 * React port of VueUse's `useToString`.
 *
 * Mapping: VueUse wraps the template-literal coercion in `computed(() => ...)`
 * and accepts a `MaybeRefOrGetter`; React has no reactive value tracking, so
 * this is a plain function returning the stringified value directly.
 *
 * @example
 * useToString(123.345)       // '123.345'
 * useToString('hi')          // 'hi'
 * useToString({ foo: 'hi' }) // '[object Object]'
 */
export function useToString(value: unknown): string {
  return `${value}`
}
