import { useEffect, useState } from 'react'

type ElementSource = HTMLElement | SVGElement | null | undefined

function isRefLike(value: ElementSource | { current: ElementSource }): value is { current: ElementSource } {
  return typeof value === 'object' && value !== null && 'current' in value
}

function toValue(value: ElementSource | { current: ElementSource } | (() => ElementSource)): ElementSource {
  if (typeof value === 'function')
    return value()
  if (isRefLike(value))
    return value.current
  return value
}

/**
 * React port of VueUse's `useParentElement`.
 *
 * Map from @vueuse/core `useParentElement`
 * (`source/vueuse/packages/core/useParentElement/`). Get the parent element
 * of the given element.
 *
 * Mapping: upstream returns a read-only `ShallowRef` set on mount and re-set
 * by `watch(() => toValue(element))` whenever the source element changes →
 * `useState` + a `useEffect` keyed on the unwrapped element identity. The
 * Vue ref return becomes a plain value (no `.value`). The source accepts a
 * plain element, a ref-like `{ current }` object or a getter (upstream:
 * `MaybeRefOrGetter<HTMLElement | SVGElement | null | undefined>`).
 *
 * Divergences from upstream (Vue reactivity does not translate 1:1):
 *
 * 1. No implicit current element: upstream's no-argument form defaults to
 *    `useCurrentElement()` (the current component's root element). React has
 *    no implicit "current component element" — pass an explicit element,
 *    ref-like object or getter; without one the value stays `undefined`.
 * 2. Like upstream's `if (el)` guard, a `null` / `undefined` source keeps
 *    the previously captured parent instead of resetting it.
 * 3. SSR-safe: the parent is captured in an effect, so no DOM is accessed
 *    while rendering and the value stays `undefined` on the server.
 * 4. Mutating a ref-like source's `.current` does not re-render in React —
 *    re-render (e.g. with your own state) for the new element to be
 *    re-captured, mirroring upstream's `watch` re-firing on ref change.
 *
 * @example
 * const childRef = useRef<HTMLDivElement>(null)
 * const parent = useParentElement(childRef)
 *
 * // with a getter — re-captured whenever it returns a different element
 * const parentOfChild = useParentElement(() => document.querySelector<HTMLElement>('#child'))
 */
export function useParentElement(
  element?: ElementSource | { current: ElementSource } | (() => ElementSource),
): ElementSource {
  const el = toValue(element)
  const [parentElement, setParentElement] = useState<ElementSource>()

  useEffect(() => {
    // mirrors upstream's `if (el)` guard: a null/undefined element keeps the
    // previously captured parent instead of resetting it
    if (el)
      setParentElement(el.parentElement)
  }, [el])

  return parentElement
}
