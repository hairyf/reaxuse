import type { MaybeRefOrGetter } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'
import { useRef } from 'react'

/**
 * Comparator deciding whether a new source value is significant enough to
 * replace the cached value.
 *
 * Upstream signature — `(newSourceValue, cachedValue) => boolean`. When it
 * returns `true`, the cache is kept as-is; when it returns `false`, the cache
 * is updated to the new source value.
 */
export type UseCachedComparator<T> = (newSourceValue: T, cachedValue: T) => boolean

/**
 * React port of VueUse's `useCached`.
 *
 * Map from @vueuse/core `useCached`
 * (`source/vueuse/packages/core/useCached/`). Caches a value with a custom
 * comparator: the returned value only moves when the comparator reports that
 * the new source differs significantly from it, otherwise the previous value
 * is kept.
 *
 * Adjustment for React: upstream wraps a `Ref` with a `watch` that copies the
 * source into the cache whenever the comparator returns `false` — a plain
 * value cannot be watched, so the port derives the cache from the props at
 * render: a ref holds the cached value and every render runs
 * `comparator(resolved source, cached)`; on `false` the ref adopts the new
 * source and the updated cache is returned. The comparator therefore runs on
 * every render instead of only on changes — harmless, since `true` keeps the
 * cache. The source is a plain value per the mapped API, and also accepts a
 * ref-like `{ current }` object or a getter (resolved via `toValue`, like the
 * other core hooks); getters that return a brand-new reference every call
 * should use a comparator that does not rely on reference identity.
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const [source, setSource] = useState({ value: 42, extra: 0 })
 * const cached = useCached(source, (newSourceValue, cachedValue) => newSourceValue.value === cachedValue.value)
 *
 * setSource({ value: 42, extra: 1 })
 * cached // { value: 42, extra: 0 } — only `value` is significant
 *
 * setSource({ value: 43, extra: 1 })
 * cached // { value: 43, extra: 1 } — significant change, cache follows
 */
export function useCached<T>(
  source: MaybeRefOrGetter<T>,
  comparator: UseCachedComparator<T> = (newSourceValue, cachedValue) => newSourceValue === cachedValue,
): T {
  const sourceValue = toValue(source)

  // derived state during render — the initial mount seeds the cache with the
  // source, then each render adopts the new source only when the comparator
  // deems the change significant (upstream: the `watch` callback)
  const cachedRef = useRef<T>(undefined as unknown as T)
  const initializedRef = useRef(false)
  if (!initializedRef.current) {
    initializedRef.current = true
    cachedRef.current = sourceValue
  }
  else if (!comparator(sourceValue, cachedRef.current)) {
    cachedRef.current = sourceValue
  }

  return cachedRef.current
}
