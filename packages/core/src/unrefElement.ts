import type { ElementTarget, TargetElement } from './useResizeObserver'
import { toValue } from '@reaxuse/shared'

/**
 * Return type of `unrefElement`. Upstream keeps the Vue component-instance
 * branch (`T extends VueInstance ? Exclude<MaybeElement, VueInstance> : T | undefined`);
 * React refs hold DOM nodes directly, so it simply resolves to `T | undefined`.
 */
export type UnRefElementReturn<T extends TargetElement = TargetElement> = T | undefined

/**
 * Get the DOM element of a React ref-like object or a plain element.
 *
 * Map from @vueuse/core `unrefElement`
 * (`source/vueuse/packages/core/unrefElement/`), which unwraps a Vue ref or
 * component instance to its underlying DOM element (`plain?.$el ?? plain`).
 *
 * React adaptation: there is no Vue component-instance analog in React — refs
 * already hold DOM nodes via `{ current }` — so the `$el` unwrap branch and the
 * `VueInstance` members of upstream's `MaybeElement` are omitted. The function
 * is a plain, hook-free utility: it resolves a React ref-like object
 * (`{ current }`) or a raw element through `toValue` and returns the underlying
 * DOM element, or `undefined`/`null` unchanged when the input resolves to one
 * of those.
 *
 * @param elRef - React ref-like object (`{ current }`) or the element itself
 * @example
 * const div = useRef<HTMLDivElement>(null)
 * div.current = document.querySelector<HTMLDivElement>('div')!
 * console.log(unrefElement(div)) // the <div> element (div.current)
 */
export function unrefElement<T extends TargetElement = TargetElement>(
  elRef: ElementTarget<T>,
): UnRefElementReturn<T> {
  return toValue(elRef)
}
