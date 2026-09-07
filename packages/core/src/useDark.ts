import type { ConfigurableWindow } from '@reaxuse/shared'
import type { BasicColorSchema } from './useColorMode'
import type { StorageLike } from './useStorage'
import { useCallback, useEffect, useRef } from 'react'
import { usePreferredDark } from './usePreferredDark'
import { useStorage } from './useStorage'

export interface UseDarkOptions extends ConfigurableWindow {
  /**
   * Value applying to the target element when isDark=true
   *
   * @default 'dark'
   */
  valueDark?: string

  /**
   * Value applying to the target element when isDark=false
   *
   * @default ''
   */
  valueLight?: string

  /**
   * A custom handler for handle the updates.
   * When specified, the default behavior will be overridden.
   *
   * @default undefined
   */
  onChanged?: (isDark: boolean, defaultHandler: (mode: BasicColorSchema) => void, mode: BasicColorSchema) => void

  /**
   * CSS Selector for the target element applying to
   *
   * @default 'html'
   */
  selector?: string

  /**
   * HTML attribute applying the target element
   *
   * @default 'class'
   */
  attribute?: string

  /**
   * The initial color mode
   *
   * @default 'auto'
   */
  initialValue?: BasicColorSchema

  /**
   * Key to persist the data into localStorage/sessionStorage.
   *
   * Pass `null` to disable persistence
   *
   * @default 'vueuse-color-scheme'
   */
  storageKey?: string | null

  /**
   * Storage object, can be localStorage or sessionStorage
   *
   * @default localStorage
   */
  storage?: StorageLike

  /**
   * Listen to storage changes — useful for multiple tabs applications and
   * for hook instances sharing the same key within the same document.
   *
   * @default true
   */
  listenToStorageChanges?: boolean

  /**
   * Disable transition on switch
   *
   * @see https://paco.me/writing/disable-theme-transitions
   * @default true
   */
  disableTransition?: boolean
}

export type UseDarkReturn = [
  isDark: boolean,
  toggleDark: () => void,
]

const CSS_DISABLE_TRANS = '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}'

// No-op `StorageLike` used when persistence is disabled (`storageKey: null`):
// `useStorage` is still called unconditionally (React rules of hooks), but the
// backend never touches real storage — the state stays in memory, mirroring
// upstream's `toRef(initialValue)` fallback.
const noopStorage: StorageLike = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

/**
 * Apply the resolved mode to the target element — the class/attribute
 * manipulation inlined from upstream's `useColorMode` `updateHTMLAttrs`.
 */
function updateHTMLAttrs(
  win: Window,
  selector: string,
  attribute: string,
  value: string,
  modes: Record<BasicColorSchema, string>,
  disableTransition: boolean,
): void {
  const el = win.document.querySelector(selector)
  if (!el)
    return

  const classesToAdd = new Set<string>()
  const classesToRemove = new Set<string>()
  let attributeToChange: { key: string, value: string } | null = null

  if (attribute === 'class') {
    const current = value.split(/\s/g)
    Object.values(modes)
      .flatMap(i => (i || '').split(/\s/g))
      .filter(Boolean)
      .forEach((v) => {
        if (current.includes(v))
          classesToAdd.add(v)
        else
          classesToRemove.add(v)
      })
  }
  else {
    attributeToChange = { key: attribute, value }
  }

  if (classesToAdd.size === 0 && classesToRemove.size === 0 && attributeToChange === null)
    // Nothing changed so we can avoid reflowing the page
    return

  let style: HTMLStyleElement | undefined
  if (disableTransition) {
    style = win.document.createElement('style')
    style.appendChild(win.document.createTextNode(CSS_DISABLE_TRANS))
    win.document.head.appendChild(style)
  }

  for (const c of classesToAdd)
    el.classList.add(c)
  for (const c of classesToRemove)
    el.classList.remove(c)
  if (attributeToChange)
    el.setAttribute(attributeToChange.key, attributeToChange.value)

  if (disableTransition) {
    // Calling getComputedStyle forces the browser to redraw
    const _ = win.getComputedStyle(style!).opacity
    win.document.head.removeChild(style!)
  }
}

/**
 * Reactive dark mode with auto data persistence.
 *
 * Map from @vueuse/core `useDark`
 * (`source/vueuse/packages/core/useDark/`). Reactive dark mode with auto data
 * persistence: on start up it reads the value from localStorage (the key is
 * configurable) to see if there is a user configured color scheme, if not, it
 * uses the user's system preference. Changing `isDark` updates the target
 * element's attribute and stores the preference for persistence.
 *
 * `useColorMode` (#95) is not implemented yet, so its necessary logic is
 * inlined here: the selector/attribute/storage persistence, the
 * `prefers-color-scheme` detection (via `usePreferredDark`) and the
 * `onChanged` callback are all self-contained in this hook. Once
 * `useColorMode` (#95) lands this should be refactored to compose it.
 *
 * React divergences:
 * - the Vue `WritableComputedRef<boolean>` return becomes a state-like tuple
 *   `[isDark, toggleDark]`: `isDark` is plain boolean state (re-renders the
 *   component on change) and `toggleDark` is a toggle callback (upstream
 *   composes `useToggle(isDark)` for the same effect);
 * - upstream's immediate `watch(state, onChanged)` (Vue reactivity) becomes a
 *   `useEffect` on the resolved mode, which also fires on mount (SSR-safe: the
 *   attribute application is skipped when there is no `window`);
 * - the `onChanged` handler is wrapped with `isDark` and the resolved mode, as
 *   upstream does, and the `modes` map is derived from `valueDark`/`valueLight`
 *   inside the effect;
 * - `storageKey: null` keeps working (persistence disabled) by routing
 *   `useStorage` through a no-op backend instead of upstream's conditional
 *   `toRef` branch — `useStorage` is always called so the hook is rules-of-hooks
 *   compliant;
 * - the component variant (`UseDark`) is not ported (the React port has no
 *   component wrappers).
 *
 * @example
 * const [isDark, toggleDark] = useDark()
 * toggleDark() // flips dark mode, persists the preference
 *
 * @see https://vueuse.org/core/useDark/
 */
export function useDark(options: UseDarkOptions = {}): UseDarkReturn {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const {
    initialValue = 'auto',
    storageKey = 'vueuse-color-scheme',
  } = options

  // inlined `useColorMode`: system preference + persisted store
  const preferredDark = usePreferredDark({ window: options.window })
  const system = preferredDark ? 'dark' : 'light'

  const [store, setStore] = useStorage<BasicColorSchema>(
    storageKey ?? '',
    initialValue,
    storageKey == null ? noopStorage : options.storage,
    { window: options.window, listenToStorageChanges: options.listenToStorageChanges },
  )

  // resolved mode — `store` of `auto` follows the system preference
  const state: BasicColorSchema = store === 'auto' ? system : (store ?? initialValue)
  const isDark = state === 'dark'

  // upstream: `set(v)` on the writable computed + `useToggle` — flip the
  // mode; matching the system mode stores `auto`
  const toggleDark = useCallback(() => {
    setStore((currentStore) => {
      const current = currentStore ?? initialValue
      const currentState = current === 'auto' ? system : current
      const modeVal = currentState === 'dark' ? 'light' : 'dark'
      return system === modeVal ? 'auto' : modeVal
    })
  }, [system, setStore, initialValue])

  // inlined `useColorMode` `watch(state, onChanged, { immediate: true })` +
  // `tryOnMounted` — apply the mode to the DOM whenever it changes
  useEffect(() => {
    const {
      onChanged,
      window: winOption,
      selector = 'html',
      attribute = 'class',
      disableTransition = true,
      valueDark: vDark = 'dark',
      valueLight: vLight = '',
    } = optionsRef.current

    const win = winOption ?? (typeof window === 'undefined' ? undefined : window)
    if (!win?.document)
      return

    const modes: Record<BasicColorSchema, string> = { auto: '', light: vLight, dark: vDark }
    const defaultHandler = (mode: BasicColorSchema) => {
      updateHTMLAttrs(win, selector, attribute, modes[mode] ?? mode, modes, disableTransition)
    }

    if (onChanged)
      onChanged(isDark, defaultHandler, state)
    else
      defaultHandler(state)
  }, [state, isDark])

  return [isDark, toggleDark]
}
