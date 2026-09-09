import type { ConfigurableWindow } from '@reaxuse/shared'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const WRITABLE_PROPERTIES = [
  'hash',
  'host',
  'hostname',
  'href',
  'pathname',
  'port',
  'protocol',
  'search',
] as const

export interface UseBrowserLocationOptions extends ConfigurableWindow {}

export interface BrowserLocationState {
  readonly trigger: string
  readonly state?: any
  readonly length?: number
  readonly origin?: string
  hash?: string
  host?: string
  hostname?: string
  href?: string
  pathname?: string
  port?: string
  protocol?: string
  search?: string
}

/**
 * Reactive browser location.
 *
 * Map from @vueuse/core `useBrowserLocation`
 * (`source/vueuse/packages/core/useBrowserLocation/`). Mirrors the current
 * `window.location` as a live object — read URL parts from `href`, `pathname`,
 * `search`, `hash`, ... and navigate by assigning a writable field. The object
 * updates on `popstate` / `hashchange` events (initial value `trigger: 'load'`).
 *
 * React divergences from upstream:
 *
 * 1. The Vue `Ref<BrowserLocationState>` return becomes a plain state object
 *    returned directly — read `location.href`, `location.pathname`, ... like
 *    upstream's `state.value.*`.
 * 2. Writable refs → writable accessors: assigning a writable field (e.g.
 *    `location.hash = '#top'`) writes the value through to
 *    `window.location[key]` and navigates, exactly like upstream's write-back
 *    watcher (a no-op when the value is unchanged). Read-only members
 *    (`trigger`, `state`, `length`, `origin`) are getter-only.
 * 3. The `popstate` / `hashchange` listeners (passive, matching upstream) are
 *    registered in a `useEffect` with cleanup. There is no Vue scheduler
 *    flush — the state only changes from events and setters, so plain
 *    initialization never writes anything back to the URL.
 *
 * @example
 * const location = useBrowserLocation()
 *
 * location.hash = '#top' // navigate: URL hash becomes `#top`
 * console.log(location.href)
 */
export function useBrowserLocation(options: UseBrowserLocationOptions = {}): BrowserLocationState {
  const { window: windowOption } = options

  // resolve the window without touching `window.location` — safe during
  // render and on the server; an explicit `window: null` opts out entirely
  const win = windowOption !== undefined
    ? windowOption
    : (typeof window === 'undefined' ? undefined : window)

  const buildState = useCallback((trigger: string): BrowserLocationState => {
    const { state, length } = win?.history ?? {}
    const { origin } = win?.location ?? {}

    return {
      trigger,
      state,
      length,
      origin,
      hash: win?.location?.hash,
      host: win?.location?.host,
      hostname: win?.location?.hostname,
      href: win?.location?.href,
      pathname: win?.location?.pathname,
      port: win?.location?.port,
      protocol: win?.location?.protocol,
      search: win?.location?.search,
    }
  }, [win])

  const [state, setState] = useState<BrowserLocationState>(() => buildState('load'))

  // latest-state ref synced each render so the memoized accessor object below
  // always reads the newest snapshot without being recreated on every change
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    if (!win)
      return

    const listenerOptions: AddEventListenerOptions = { passive: true }
    const onPopstate = () => setState(buildState('popstate'))
    const onHashchange = () => setState(buildState('hashchange'))

    win.addEventListener('popstate', onPopstate, listenerOptions)
    win.addEventListener('hashchange', onHashchange, listenerOptions)

    return () => {
      win.removeEventListener('popstate', onPopstate)
      win.removeEventListener('hashchange', onHashchange)
    }
  }, [win, buildState])

  // stable live mirror: getters proxy the latest state snapshot, writable
  // fields write through to `window.location` (upstream's write-back watcher)
  return useMemo(() => {
    const descriptors: PropertyDescriptorMap = {}

    for (const key of WRITABLE_PROPERTIES) {
      descriptors[key] = {
        enumerable: true,
        configurable: true,
        get: () => stateRef.current[key],
        set: (value: string) => {
          if (!win?.location || win.location[key] === value) {
            return
          }
          ;(win.location as any)[key] = value
        },
      }
    }

    for (const key of ['trigger', 'state', 'length', 'origin'] as const) {
      descriptors[key] = {
        enumerable: true,
        configurable: true,
        get: () => stateRef.current[key],
      }
    }

    return Object.defineProperties({}, descriptors) as BrowserLocationState
  }, [win])
}
