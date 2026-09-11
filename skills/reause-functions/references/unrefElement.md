---
category: Component
---

# unrefElement

Get the DOM element of a React ref-like object or a plain element

## Usage

```tsx
import { unrefElement } from '@reause/core'
import { useEffect, useRef } from 'react'

const div = useRef<HTMLDivElement>(null)

useEffect(() => {
  console.log(unrefElement(div)) // the <div> element (div.current)
})
```

## React divergences

- **Callback refs are not supported.** VueUse accepts getters (`MaybeRefOrGetter`), but React's
  callback ref (`ref={(el) => { ... }}`) is a function and `toValue` _invokes_ functions instead of
  resolving them — a callback ref would be called with no arguments and never yield a DOM node.
  `unrefElement` therefore accepts only an element or a `{ current }` ref object (`RefObject`); the
  `RefCallback` arm is rejected at the type level. Use `useRef` when you need to pass a ref.
- **No Vue component instances.** React refs hold DOM nodes directly, so upstream's `$el` unwrap and
  the `VueInstance` members of `MaybeElement` have no equivalent here.

## Type Declarations

```ts
/**
 * Return type of `unrefElement`. Upstream keeps the Vue component-instance
 * branch (`T extends VueInstance ? Exclude<MaybeElement, VueInstance> : T | undefined`);
 * React refs hold DOM nodes directly, so it simply resolves to `T | undefined`.
 */
export type UnRefElementReturn<T extends TargetElement = TargetElement> =
  T | undefined
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
 * Callback refs are NOT supported: React's `RefCallback`
 * (`ref={(el) => { ... }}`) is a function, and `toValue` *invokes* functions
 * instead of resolving them, so a callback ref would be called with no
 * arguments and never yield a DOM node. `ElementTarget` therefore excludes the
 * `RefCallback` arm; pass a `useRef` object (`{ current }`) instead.
 *
 * @param elRef - React ref object (`{ current }`) or the element itself;
 * callback refs are rejected at the type level
 * @example
 * const div = useRef<HTMLDivElement>(null)
 * div.current = document.querySelector<HTMLDivElement>('div')!
 * console.log(unrefElement(div)) // the <div> element (div.current)
 */
export declare function unrefElement<T extends TargetElement = TargetElement>(
  elRef: ElementTarget<T>,
): UnRefElementReturn<T>
```
