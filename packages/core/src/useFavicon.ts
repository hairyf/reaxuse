import type { RefOrValue } from '@reaxuse/shared'
import type { Dispatch, SetStateAction } from 'react'
import { isRefLike, toValue } from '@reaxuse/shared'
import { useEffect, useRef, useState } from 'react'

export interface UseFaviconOptions {
  /**
   * The base URL to prepend to the favicon path.
   *
   * @default ''
   */
  baseUrl?: string
  /**
   * Specify a custom `document` instance, e.g. working with iframes or in
   * testing environments. Inlined here — `ConfigurableDocument` is not ported
   * to `@reaxuse/shared`, so `document?` mirrors the option `useTitle` exposes
   * (defaults to the global `document` when not provided).
   */
  document?: Document | null
  /**
   * The `<link>` `rel` attribute to manage.
   *
   * @default 'icon'
   */
  rel?: string
}

export type UseFaviconReturn = [
  icon: string | null | undefined,
  setIcon: Dispatch<SetStateAction<string | null | undefined>>,
]

/**
 * Resolve the `document` to work against: an explicitly provided option wins
 * (`null` opts out entirely, mirroring upstream's `ConfigurableDocument`),
 * otherwise the global `document` on the client. Never called during render,
 * so the hook stays safe to use on the server.
 */
function resolveDocument(doc: Document | null | undefined): Document | undefined {
  if (doc !== undefined)
    return doc || undefined
  return typeof document === 'undefined' ? undefined : document
}

/**
 * React port of VueUse's `useFavicon`.
 *
 * Map from @vueuse/core `useFavicon`
 * (`source/vueuse/packages/core/useFavicon/`). Reactive favicon: keeps the
 * current favicon URL in component state and writes it back to the
 * `<link rel="icon">` element(s) in the document `<head>` on change
 * (creating one when none exists).
 *
 * Return tuple follows this repo's React idiom:
 * `const [icon, setIcon] = useFavicon()` (upstream returns a single Vue ref —
 * a readonly `ComputedRef` when the source is a ref/getter).
 *
 * React divergences:
 * - upstream adopts the value at setup and applies it synchronously via a
 *   `watch(..., { immediate: true })`; React must not touch the DOM during
 *   render (SSR-safe), so the DOM write happens in an effect — the initial
 *   icon is applied on mount instead;
 * - the icon write is a `useEffect` on the state instead of a Vue watcher;
 * - a ref-like (`{ current }`) or getter source is re-read after every render
 *   and written back into the state when it changed (React has no reactive
 *   refs; upstream only watches ref/getter sources) — a plain
 *   `string`/`null`/`undefined` argument is never re-synced, so the setter
 *   stays authoritative there;
 * - for ref-like sources the setter also writes through to the source's
 *   `.current` (upstream returns the very ref it was given), while getter
 *   sources behave readonly, mirroring upstream's `ComputedRef` return;
 * - setting `null`/`undefined` through the setter updates the state but
 *   leaves the existing `<link>` untouched (upstream would leave it stale
 *   too, since the watcher only applies string values).
 *
 * It's not SSR compatible: your value will be applied only on client-side.
 *
 * @example
 * const [icon, setIcon] = useFavicon('dark.png')
 * console.log(icon) // print current icon
 * setIcon('light.png') // change current icon
 */
export function useFavicon(
  newIcon?: RefOrValue<string | null | undefined>,
  options: UseFaviconOptions = {},
): UseFaviconReturn {
  // latest-value refs synced each render so the effects below stay stable
  // and always read the newest argument/options (house pattern)
  const newIconRef = useRef(newIcon)
  const optionsRef = useRef(options)
  newIconRef.current = newIcon
  optionsRef.current = options

  // upstream: `toRef(newIcon)` — `undefined` falls back to the default `null`
  const [icon, setIcon] = useState<string | null | undefined>(
    () => newIcon === undefined ? null : toValue(newIcon),
  )

  // latest state so the re-sync effect can compare without depending on `icon`
  const iconRef = useRef(icon)
  iconRef.current = icon

  // Write-through setter: upstream returns the very ref it was given, so
  // writing to the return is writing to the source — for a ref-like source we
  // mirror that by also updating its `.current`.
  const setFavicon: Dispatch<SetStateAction<string | null | undefined>> = (next) => {
    const source = newIconRef.current
    if (isRefLike(source)) {
      source.current = typeof next === 'function'
        ? next(toValue(source))
        : next
    }
    setIcon(next)
  }

  // Re-sync ref-like / getter sources (upstream `watch` on the passed ref /
  // computed). React has no reactive refs, so the source is re-read after
  // every render and any change is written into the state. A plain-value
  // argument is never re-synced, keeping the setter authoritative.
  useEffect(() => {
    const source = newIconRef.current
    if (typeof source !== 'function' && !isRefLike(source))
      return

    const resolved = toValue(source)
    if (resolved !== iconRef.current)
      setIcon(resolved)
  })

  // The DOM write is an effect on the state (upstream: `watch` with
  // `immediate: true`, which also covers the initial icon on mount).
  useEffect(() => {
    if (typeof icon !== 'string')
      return

    const doc = resolveDocument(optionsRef.current.document)
    if (!doc?.head)
      return

    const { baseUrl = '', rel = 'icon' } = optionsRef.current
    const elements = doc.head.querySelectorAll<HTMLLinkElement>(`link[rel*="${rel}"]`)
    if (elements.length === 0) {
      const link = doc.createElement('link')
      link.rel = rel
      link.href = `${baseUrl}${icon}`
      link.type = `image/${icon.split('.').pop()}`
      doc.head.append(link)
      return
    }
    elements.forEach((el) => {
      el.href = `${baseUrl}${icon}`
    })
  }, [icon])

  return [icon, setFavicon]
}
