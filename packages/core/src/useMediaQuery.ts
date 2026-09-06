import type { ConfigurableWindow, MaybeRefOrGetter } from '@reaxuse/shared'
import { pxValue, toValue } from '@reaxuse/shared'
import { useEffect, useState } from 'react'

/**
 * React port of VueUse's `useMediaQuery`.
 *
 * Map from @vueuse/core `useMediaQuery`
 * (`source/vueuse/packages/core/useMediaQuery/`), which creates a
 * `MediaQueryList` for the query string and returns a reactive boolean
 * (`computed`) that flips on its `change` event. Reactive
 * [Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Testing_media_queries)
 * — a plain boolean, `true` while the query matches.
 *
 * React divergences:
 * - the Vue `computed<boolean>` return becomes a plain boolean state, so
 *   components re-render on media query changes;
 * - the `matchMedia` query and its `change` listener attach inside a
 *   self-contained `useEffect` (upstream binds through `useEventListener`)
 *   and are removed on unmount;
 * - `query` accepts a plain string, a ref-like `{ current }` object or a
 *   getter (upstream `MaybeRefOrGetter`); it is re-resolved on every render
 *   and the media query re-binds when the resolved string changes;
 * - the initial `matches` sync happens in the mount effect instead of during
 *   setup, so SSR renders the `false` default without touching `window`;
 * - the upstream `ssrSupport` branch (a numeric `ssrWidth` fallback that
 *   approximates the query from a simulated viewport width) is evaluated in
 *   the same effect: it is used only while `matchMedia` is unavailable (e.g.
 *   SSR) and the real `matchMedia` result wins on the client — matching
 *   upstream's post-mount state.
 *
 * @example
 * const isLargeScreen = useMediaQuery('(min-width: 1024px)')
 * const isPreferredDark = useMediaQuery('(prefers-color-scheme: dark)')
 */
export function useMediaQuery(
  query: MaybeRefOrGetter<string>,
  options: ConfigurableWindow & { ssrWidth?: number } = {},
): boolean {
  const { window: windowOption, ssrWidth } = options
  const [matches, setMatches] = useState(false)

  // re-resolved on every render so ref-like `{ current }` / getter queries
  // re-bind whenever the resolved query string changes (upstream reactivity)
  const trackedQuery = toValue(query)
  const trackedWindow = windowOption === undefined
    ? (typeof window === 'undefined' ? undefined : window)
    : windowOption

  useEffect(() => {
    const isSupported = Boolean(
      trackedWindow
      && 'matchMedia' in trackedWindow
      && typeof trackedWindow.matchMedia === 'function',
    )

    // SSR width fallback — upstream `ssrSupport` branch: a numeric `ssrWidth`
    // approximates the query while `matchMedia` is unavailable; on the client
    // the real `matchMedia` result wins
    if (typeof ssrWidth === 'number' && !isSupported) {
      const queryStrings = trackedQuery.split(',')
      setMatches(queryStrings.some((queryString) => {
        const not = queryString.includes('not all')
        const minWidth = queryString.match(/\(\s*min-width:\s*(-?\d+(?:\.\d*)?[a-z]+\s*)\)/)
        const maxWidth = queryString.match(/\(\s*max-width:\s*(-?\d+(?:\.\d*)?[a-z]+\s*)\)/)
        let res = Boolean(minWidth || maxWidth)
        if (minWidth && res)
          res = ssrWidth >= pxValue(minWidth[1])
        if (maxWidth && res)
          res = ssrWidth <= pxValue(maxWidth[1])
        return not ? !res : res
      }))
      return
    }

    if (!isSupported || !trackedWindow)
      return

    const mediaQuery = trackedWindow.matchMedia(trackedQuery)
    const update = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    setMatches(mediaQuery.matches)
    mediaQuery.addEventListener('change', update, { passive: true })

    return () => {
      mediaQuery.removeEventListener('change', update)
    }
  }, [trackedQuery, trackedWindow, ssrWidth])

  return matches
}
