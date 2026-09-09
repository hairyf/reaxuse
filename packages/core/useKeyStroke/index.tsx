import type { RefOrValue } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'
import { useCallback, useRef } from 'react'
import { useEventListener } from '../useEventListener'

export type KeyPredicate = (event: KeyboardEvent) => boolean
export type KeyFilter = true | string | string[] | KeyPredicate
export type KeyStrokeEventName = 'keydown' | 'keypress' | 'keyup'

export interface UseKeyStrokeOptions {
  /**
   * Event name to listen to.
   *
   * @default 'keydown'
   */
  eventName?: KeyStrokeEventName
  /**
   * Event target to listen on. A plain element or a ref-like `{ current }`
   * object (`RefOrValue`).
   *
   * @default window
   */
  target?: RefOrValue<EventTarget | null | undefined>
  /**
   * Set to `true` to use a passive event listener.
   *
   * @default false
   */
  passive?: boolean
  /**
   * Set to `true` to ignore repeated events when the key is being held down.
   *
   * @default false
   */
  dedupe?: RefOrValue<boolean>
}

function createKeyPredicate(keyFilter: KeyFilter): KeyPredicate {
  if (typeof keyFilter === 'function')
    return keyFilter

  else if (typeof keyFilter === 'string')
    return (event: KeyboardEvent) => event.key === keyFilter

  else if (Array.isArray(keyFilter))
    return (event: KeyboardEvent) => keyFilter.includes(event.key)

  return () => true
}

/**
 * Listen for keyboard keystrokes. By default, listens on `keydown` events on `window`.
 *
 * Map from @vueuse/core `onKeyStroke`
 * (`source/vueuse/packages/core/onKeyStroke/`). Accepts a single key, an
 * array of keys, `true` (any key) or a custom predicate as the key filter,
 * and supports the `keypress` / `keyup` events, a custom `target`, `passive`
 * listeners and `dedupe` (ignore repeated
 * [`KeyboardEvent.repeat`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/repeat)
 * events while a key is held down).
 *
 * React divergences:
 * - React has no composable-function API, so this is a hook (upstream's
 *   `onKeyStroke` is a plain function): the listener is registered in a
 *   mount effect and removed on unmount;
 * - the handler is read through a latest-value ref, so new inline handler
 *   identities never cause re-subscription — only resolved
 *   target / event name / passive changes re-bind the listener;
 * - the returned value is a stop function (`() => void`) that removes the
 *   currently registered listener (upstream returns a Vue `Fn` that stops its
 *   internal watcher);
 * - SSR-safe: nothing touches `window` during render — the default window
 *   target only resolves when `window` is defined and binding happens in the
 *   mount effect.
 *
 * @see https://vueuse.org/core/onKeyStroke/
 *
 * @example
 * useKeyStroke('ArrowDown', (e) => {
 *   e.preventDefault()
 * })
 *
 * const stop = useKeyStroke('Escape', handler)
 * stop()
 */
export function useKeyStroke(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options?: UseKeyStrokeOptions,
): () => void
export function useKeyStroke(
  handler: (event: KeyboardEvent) => void,
  options?: UseKeyStrokeOptions,
): () => void
export function useKeyStroke(
  ...args: [] | [KeyFilter, (event: KeyboardEvent) => void, UseKeyStrokeOptions?] | [(event: KeyboardEvent) => void, UseKeyStrokeOptions?]
): () => void {
  let key: KeyFilter
  let handler: (event: KeyboardEvent) => void
  let options: UseKeyStrokeOptions = {}

  if (args.length === 3) {
    key = args[0]
    handler = args[1]
    options = args[2] ?? {}
  }
  else if (args.length === 2) {
    if (typeof args[1] === 'object') {
      key = true
      handler = args[0] as (event: KeyboardEvent) => void
      options = args[1] ?? {}
    }
    else {
      key = args[0] as KeyFilter
      handler = args[1] as (event: KeyboardEvent) => void
    }
  }
  else {
    key = true
    handler = args[0] as (event: KeyboardEvent) => void
  }

  const defaultWindow = typeof window === 'undefined' ? undefined : window
  const {
    target = defaultWindow,
    eventName = 'keydown',
    passive = false,
    dedupe = false,
  } = options
  const predicate = createKeyPredicate(key)
  // latest-value ref synced each render so the mount-bound listener always
  // reads the newest handler (stable listener identity — no re-subscription)
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  const listener = (e: KeyboardEvent) => {
    if (e.repeat && toValue(dedupe))
      return

    if (predicate(e))
      handlerRef.current(e)
  }

  const stop = useEventListener(target, eventName, listener, passive)
  return useCallback(() => stop?.(), [stop])
}

/**
 * Listen to the `keydown` event of the given key.
 *
 * Map from @vueuse/core `onKeyDown`
 * (`source/vueuse/packages/core/onKeyStroke/`) — shorthand for
 * `useKeyStroke(key, handler, { ...options, eventName: 'keydown' })`.
 *
 * @see https://vueuse.org/onKeyStroke
 *
 * @example
 * useKeyDown('ArrowDown', (e) => {
 *   e.preventDefault()
 * })
 */
export function useKeyDown(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options: Omit<UseKeyStrokeOptions, 'eventName'> = {},
): () => void {
  return useKeyStroke(key, handler, { ...options, eventName: 'keydown' })
}

/**
 * Listen to the `keypress` event of the given key.
 *
 * Map from @vueuse/core `onKeyPressed`
 * (`source/vueuse/packages/core/onKeyStroke/`) — shorthand for
 * `useKeyStroke(key, handler, { ...options, eventName: 'keypress' })`.
 *
 * @see https://vueuse.org/onKeyStroke
 *
 * @example
 * useKeyPressed('a', (e) => {
 *   console.log(e.key)
 * })
 */
export function useKeyPressed(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options: Omit<UseKeyStrokeOptions, 'eventName'> = {},
): () => void {
  return useKeyStroke(key, handler, { ...options, eventName: 'keypress' })
}

/**
 * Listen to the `keyup` event of the given key.
 *
 * Map from @vueuse/core `onKeyUp`
 * (`source/vueuse/packages/core/onKeyStroke/`) — shorthand for
 * `useKeyStroke(key, handler, { ...options, eventName: 'keyup' })`.
 *
 * @see https://vueuse.org/onKeyStroke
 *
 * @example
 * useKeyUp('Shift', () => console.log('Shift key up'))
 */
export function useKeyUp(
  key: KeyFilter,
  handler: (event: KeyboardEvent) => void,
  options: Omit<UseKeyStrokeOptions, 'eventName'> = {},
): () => void {
  return useKeyStroke(key, handler, { ...options, eventName: 'keyup' })
}
