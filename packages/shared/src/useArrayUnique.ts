import type { MaybeRef } from './index'

export type UseArrayUniqueReturn<T = any> = T[]

/**
 * Reactive `Array.unique`
 *
 * React port of VueUse's `useArrayUnique`.
 *
 * Mapping: upstream wraps `toValue(list)` in `computed(() => ...)` and returns
 * a `ComputedRef`; React has no reactive value tracking, so this is a plain
 * function recomputed on every render — the result is a deduped plain array
 * (no `.value`, no caching). Vue refs map to the repo's `MaybeRef`
 * (`T | { current: T }`): the list itself may be ref-like and every element is
 * unwrapped before the dedupe runs. Duplicate detection uses a `Set` of the
 * unwrapped values (reference identity for objects) unless a custom
 * `compareFn` is given — same as upstream. Mutating a ref element or the
 * array does not trigger anything by itself — the new result shows up on the
 * next render.
 *
 * @see https://vueuse.org/shared/useArrayUnique/
 *
 * @example
 * const [list, setList] = useState([0, 2, 2, 4, 4, 4])
 * const result = useArrayUnique(list) // [0, 2, 4]
 *
 * setList([0, 2, 4, 6, 6]) // result === [0, 2, 4, 6] on the next render
 */
export function useArrayUnique<T>(
  list: MaybeRef<MaybeRef<T>[]>,
  compareFn?: (a: T, b: T, array: T[]) => boolean,
): UseArrayUniqueReturn<T> {
  const resolvedList = toValue(list).map(element => toValue(element))
  return compareFn ? uniqueElementsBy(resolvedList, compareFn) : uniq(resolvedList)
}

function uniq<T>(array: T[]) {
  return Array.from(new Set(array))
}

function uniqueElementsBy<T>(
  array: T[],
  fn: (a: T, b: T, array: T[]) => boolean,
) {
  return array.reduce<T[]>((acc, v) => {
    if (!acc.some(x => fn(v, x, array)))
      acc.push(v)
    return acc
  }, [])
}

function toValue<T>(value: MaybeRef<T>): T {
  return isRefLike(value) ? value.current : value
}

function isRefLike<T>(value: MaybeRef<T>): value is { current: T } {
  return value !== null && typeof value === 'object' && 'current' in value
}
