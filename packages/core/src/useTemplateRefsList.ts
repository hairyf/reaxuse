import { useRef } from 'react'

/**
 * A list of collected refs with an attached `setAt(index, value)` slot setter.
 */
export type TemplateRefsList<T> = T[] & { setAt: (index: number, value: T | null) => void }

/**
 * Creates the stable, per-instance refs list: an array with the `setAt`
 * setter attached. The attached method and the function returned from the
 * hook are the very same function (upstream API fidelity), so either handle
 * can be stored or passed around.
 */
function createRefsList<T>(): TemplateRefsList<T> {
  // the slots physically hold `T | null` — React hands `null` to ref callbacks
  // when an element unmounts — while the public type stays `T[]` like upstream
  const slots: (T | null)[] = []
  const setAt = (index: number, value: T | null): void => {
    slots[index] = value
  }
  const refs = slots as unknown as TemplateRefsList<T>
  refs.setAt = setAt
  return refs
}

/**
 * React port of VueUse's `useTemplateRefsList`.
 *
 * Map from @vueuse/core `useTemplateRefsList`
 * (`source/vueuse/packages/core/useTemplateRefsList/`). Shorthand for
 * collecting refs to elements and components rendered inside a list — the
 * `v-for` `:ref` binding helper.
 *
 * React adaptation:
 *
 * - Vue returns a single readonly `Ref` of an array-with-`set` bound as
 *   `:ref="refs.set"` inside `v-for`; React binds ref callbacks instead, so
 *   the port returns a tuple `[refs, setAt]` (repo convention §2B) — `refs`
 *   is the collected list and `setAt(index, value)` writes one slot, meant to
 *   be used as `ref={el => setAt(index, el)}` while mapping the list;
 * - `refs` is a stable container: it is created once on the first render and
 *   its identity is preserved across re-renders (a ref-like container, not
 *   state) — mutating it never schedules a re-render, so read the collected
 *   slots after the commit or via an explicit re-render trigger;
 * - `setAt`'s `value` accepts `T | null` because React calls ref callbacks
 *   with `null` when an element unmounts — the slot is then set to `null`;
 * - the attached method and the returned setter are the same stable function
 *   (`refs.setAt === setAt`), keeping the upstream shape where the array
 *   itself carries the setter;
 * - upstream's `set(el)` pushes and the array is reset before every
 *   re-render (`onBeforeUpdate`); the port is index-based and never
 *   auto-resets — an element that unmounts leaves a `null` slot, reset
 *   manually with `refs.length = 0` if the list changed wholesale;
 * - upstream's `Ref<Readonly<TemplateRefsList<T>>>` immutability does not
 *   apply: React consumers hold the array identity directly, so the port
 *   returns the mutable `TemplateRefsList<T>` itself.
 *
 * @__NO_SIDE_EFFECTS__
 * @example
 * const [refs, setAt] = useTemplateRefsList<HTMLLIElement>()
 *
 * items.map((item, index) => (
 *   <li key={item} ref={el => setAt(index, el)}>{item}</li>
 * ))
 *
 * refs.length // number of collected slots
 * refs[0] // first `<li>` element, or `null` once it unmounted
 */
export function useTemplateRefsList<T = Element>(): [TemplateRefsList<T>, (index: number, value: T | null) => void] {
  const refsRef = useRef<TemplateRefsList<T> | null>(null)
  if (refsRef.current === null)
    refsRef.current = createRefsList<T>()

  const refs = refsRef.current
  return [refs, refs.setAt]
}
