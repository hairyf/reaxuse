import type { ConfigurableWindow, RefOrValue } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface UseFocusOptions extends ConfigurableWindow {
  /**
   * Initial value. If set true, then focus will be set on the target
   *
   * @default false
   */
  initialValue?: boolean

  /**
   * Replicate the :focus-visible behavior of CSS
   *
   * @default false
   */
  focusVisible?: boolean

  /**
   * Prevent scrolling to the element when it is focused.
   *
   * @default false
   */
  preventScroll?: boolean
}

/**
 * Writable ref-like mirror of upstream's `WritableComputedRef<boolean>`: read
 * `value` for the current focus state, assign `value` to focus / blur the
 * target.
 */
export interface UseFocusRef {
  value: boolean
}

export interface UseFocusReturn {
  /**
   * If read as true, then the element has focus. If read as false, then the
   * element does not have focus. If set to true, then the element will be
   * focused. If set to false, the element will be blurred.
   */
  focused: UseFocusRef
  /**
   * The same focus state as a plain boolean — the React-friendly read for
   * rendering.
   */
  isFocused: boolean
}

/**
 * React port of VueUse's `useFocus`.
 *
 * Map from @vueuse/core `useFocus`
 * (`source/vueuse/packages/core/useFocus/`). Reactive utility to track or set
 * the focus state of a DOM element. Listens to the target's `focus` / `blur`
 * events and exposes the state through `focused`, a stable ref-like object
 * mirroring upstream's `WritableComputedRef<boolean>`: read `focused.value`
 * for the current state, assign `focused.value = true` / `focused.value =
 * false` to focus / blur the target. As upstream, the assignment itself only
 * calls `focus()` / `blur()` on the element — the state is then updated by the
 * `focus` / `blur` events. `isFocused` is the same state as a plain boolean,
 * convenient for rendering.
 *
 * React divergences:
 * - upstream returns `{ focused: WritableComputedRef<boolean> }`; reaxuse
 *   returns `{ focused, isFocused }` — `focused` keeps the upstream `.value`
 *   read/write contract (a `useMemo`-stable object with a `value`
 *   getter/setter backed by the hook's state), and `isFocused` is the plain
 *   boolean state the getter is backed by;
 * - upstream composes `useEventListener` + `computed` + `watch`; here the
 *   `focus` / `blur` listeners live in a `useEffect` that re-attaches when
 *   the resolved target changes, and upstream's immediate
 *   `watch(targetElement, …)` that applies `initialValue` becomes a mount /
 *   target-change effect. Options are read through latest-value refs, so the
 *   listeners and the setter stay stable and never re-subscribe (upstream
 *   reads the options once in setup);
 * - the target is resolved with `toValue` during render (a plain element or a
 *   ref-like `{ current }` object), so SSR renders the default
 *   `false` state without touching the DOM.
 *
 * @example
 * const input = useRef<HTMLInputElement>(null)
 * const { focused, isFocused } = useFocus(input)
 *
 * focused.value = true // focus the input
 * focused.value = false // blur the input
 */
export function useFocus(
  target: RefOrValue<HTMLElement | null | undefined>,
  options: UseFocusOptions = {},
): UseFocusReturn {
  const { initialValue = false, focusVisible = false, preventScroll = false } = options

  const [isFocused, setIsFocused] = useState(false)
  const isFocusedRef = useRef(false)
  isFocusedRef.current = isFocused

  // options are read through latest-value refs by the stable listeners and
  // setter, so changing them never re-subscribes (upstream captures them in
  // setup and reads them once)
  const initialValueRef = useRef(initialValue)
  initialValueRef.current = initialValue
  const focusVisibleRef = useRef(focusVisible)
  focusVisibleRef.current = focusVisible
  const preventScrollRef = useRef(preventScroll)
  preventScrollRef.current = preventScroll

  // resolve the target during render — a pure unwrap (ref-like `.current`
  // read), no DOM access — so SSR renders the bare default state
  const elementRef = useRef<HTMLElement | null | undefined>(undefined)
  const element = toValue(target)
  elementRef.current = element

  // mirror of upstream's focus/blur listeners (bound via `useEventListener`
  // with passive options): re-attach whenever the resolved target changes
  const onFocus = useCallback((event: FocusEvent) => {
    if (!focusVisibleRef.current || (event.target as HTMLElement)?.matches?.(':focus-visible')) {
      isFocusedRef.current = true
      setIsFocused(true)
    }
  }, [])

  const onBlur = useCallback(() => {
    isFocusedRef.current = false
    setIsFocused(false)
  }, [])

  useEffect(() => {
    const el = elementRef.current
    if (!el)
      return

    const listenerOptions = { passive: true }
    el.addEventListener('focus', onFocus, listenerOptions)
    el.addEventListener('blur', onBlur, listenerOptions)

    return () => {
      el.removeEventListener('focus', onFocus)
      el.removeEventListener('blur', onBlur)
    }
  }, [element, onFocus, onBlur])

  // mirror of upstream's writable `computed` setter: assigning `focused.value`
  // triggers `focus()` / `blur()` on the target. The state itself is updated
  // by the `focus` / `blur` events (upstream behavior); the ref is kept in
  // sync synchronously so reads in the same tick are correct.
  const setFocused = useCallback((value: boolean) => {
    const el = elementRef.current
    if (!value && isFocusedRef.current)
      el?.blur()
    else if (value && !isFocusedRef.current)
      el?.focus({ preventScroll: preventScrollRef.current })
  }, [])

  // mirror of upstream's immediate `watch(targetElement, …)`: apply
  // `initialValue` on mount and whenever the resolved target changes
  useEffect(() => {
    setFocused(initialValueRef.current)
  }, [element, setFocused])

  const focused = useMemo<UseFocusRef>(() => ({
    get value(): boolean {
      return isFocusedRef.current
    },
    set value(next: boolean) {
      setFocused(next)
    },
  }), [setFocused])

  return { focused, isFocused }
}
