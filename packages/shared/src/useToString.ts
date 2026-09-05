/**
 * React port of VueUse's `useToString`.
 *
 * Mapping: VueUse returns a `computed(() => \`${toValue(value)}\`)` that
 * reactively converts a `MaybeRefOrGetter` to a string. In React there is no
 * ref wrapper to unwrap — the source is already the current value — so the
 * hook returns a plain derived string recomputed on every render (the
 * conversion is cheap, so no `useMemo`/state is needed and there is no risk
 * of a stale memo). A function source is treated as a getter and invoked,
 * mirroring VueUse's `MaybeRefOrGetter` semantics.
 *
 * @param source A value, or a getter function returning the value to convert.
 * @returns The `String(source)` result.
 *
 * @example
 * const [number, setNumber] = useState(3.14)
 * const str = useToString(number) // '3.14'
 *
 * @example
 * const str = useToString(() => `value: ${count}`)
 */
export function useToString(source: unknown): string {
  return typeof source === 'function'
    ? String((source as () => unknown)())
    : String(source)
}
