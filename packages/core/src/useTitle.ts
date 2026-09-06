import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useRef, useState } from 'react'

export interface UseTitleOptions {
  /**
   * Specify a custom `document` instance, e.g. working with iframes or in
   * testing environments.
   */
  document?: Document | null
  /**
   * Restore the original title when unmounted
   * @param originTitle original title
   * @returns restored title
   */
  restoreOnUnmount?: false | ((originalTitle: string, currentTitle: string) => string | null | undefined)
  /**
   * Observe `document.title` changes using a MutationObserver.
   * Cannot be used together with `titleTemplate` option.
   *
   * @default false
   */
  observe?: boolean
  /**
   * The template string to parse the title (e.g., '%s | My Website')
   * Cannot be used together with `observe` option.
   *
   * @default '%s'
   */
  titleTemplate?: string | ((title: string) => string)
}

export type UseTitleReturn = [
  title: string | null | undefined,
  setTitle: Dispatch<SetStateAction<string | null | undefined>>,
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
 * Apply the `titleTemplate` option: a function is called with the raw title,
 * a string replaces every `%s` placeholder (upstream default `'%s'`).
 */
function formatTitle(raw: string, template: string | ((title: string) => string) | undefined): string {
  const resolved = template || '%s'
  return typeof resolved === 'function'
    ? resolved(raw)
    : resolved.replace(/%s/g, raw)
}

/**
 * React port of VueUse's `useTitle`.
 *
 * Map from @vueuse/core `useTitle`
 * (`source/vueuse/packages/core/useTitle/`). Reactive document title: keeps
 * the document title in component state and writes it back to
 * `document.title` on change.
 *
 * Return tuple follows this repo's React idiom:
 * `const [title, setTitle] = useTitle()` (upstream returns a single Vue ref
 * — a readonly `ComputedRef` when the source is a ref/getter).
 *
 * React divergences:
 * - upstream adopts the current title synchronously at setup
 *   (`newTitle ?? document.title`); React state must initialize during
 *   render without touching `document` (SSR-safe), so the adoption happens
 *   in a mount effect — during the first render (and on the server) `title`
 *   is `newTitle ?? null`;
 * - the title write is a `useEffect` on the state instead of a Vue watcher,
 *   and setting `null`/`undefined` through the setter clears the state but
 *   leaves `document.title` untouched (upstream would write `format('')`);
 * - a plain `newTitle` argument is re-synced when it changes across renders
 *   (React has no reactive refs; upstream only propagates ref/getter sources
 *   and then returns a readonly computed — here the setter stays writable);
 * - `observe` registers a raw `MutationObserver` on the `<title>` element in
 *   an effect (upstream composes `useMutationObserver`); as upstream it is
 *   ignored when `titleTemplate` is set, and both options share a flat
 *   interface instead of upstream's union type.
 *
 * It's not SSR compatible: your value will be applied only on client-side.
 *
 * @example
 * const [title, setTitle] = useTitle()
 * console.log(title) // print current title
 * setTitle('Hello') // change current title
 */
export function useTitle(
  newTitle?: string | null | undefined,
  options: UseTitleOptions = {},
): UseTitleReturn {
  const [title, setTitle] = useState<string | null | undefined>(newTitle ?? null)

  // latest-value refs synced each render so the effects below stay stable
  // and always read the newest argument/options (house pattern)
  const titleRef = useRef(title)
  const newTitleRef = useRef(newTitle)
  const optionsRef = useRef(options)
  // pre-hook `document.title`, captured on mount (upstream: setup time);
  // `null` doubles as the "not captured yet" sentinel
  const originalTitleRef = useRef<string | null>(null)

  titleRef.current = title
  newTitleRef.current = newTitle
  optionsRef.current = options

  // upstream adopts the current title synchronously at setup
  // (`toRef(newTitle ?? document?.title ?? null)`); React initializes state
  // during render without touching `document` (SSR-safe), so the adoption
  // happens in this mount effect instead
  useEffect(() => {
    const doc = resolveDocument(optionsRef.current.document)
    if (!doc)
      return

    if (originalTitleRef.current === null)
      originalTitleRef.current = doc.title

    if (newTitleRef.current == null && doc.title !== titleRef.current)
      setTitle(doc.title)
  }, [])

  // a plain `newTitle` argument is re-synced when it changes across renders
  // (React equivalent of upstream's reactive ref/getter sources)
  useEffect(() => {
    if (newTitle == null || newTitle === titleRef.current)
      return

    setTitle(newTitle)
  }, [newTitle])

  // the title write is an effect on the state (upstream: `watch`); skipped
  // while the state is nullish so the mount adoption above is never clobbered
  useEffect(() => {
    if (title == null)
      return

    const doc = resolveDocument(optionsRef.current.document)
    if (!doc)
      return

    doc.title = formatTitle(title, optionsRef.current.titleTemplate)
  }, [title])

  // mirror external `document.title` changes back into the state; as
  // upstream, only without `titleTemplate`
  useEffect(() => {
    const { observe, titleTemplate, document: docOption } = optionsRef.current
    if (!observe || titleTemplate)
      return

    const doc = resolveDocument(docOption)
    const titleElement = doc?.head?.querySelector('title')
    if (!doc || !titleElement)
      return

    const observer = new MutationObserver(() => {
      if (doc.title !== titleRef.current)
        setTitle(doc.title)
    })
    observer.observe(titleElement, { childList: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  // restore the original title on unmount (upstream: `tryOnScopeDispose`);
  // the default restores the captured title, `false` opts out and a custom
  // function's return value wins unless it is null/undefined
  useEffect(() => {
    return () => {
      const { restoreOnUnmount: restore = t => t } = optionsRef.current
      if (!restore)
        return

      const doc = resolveDocument(optionsRef.current.document)
      if (!doc)
        return

      const restoredTitle = restore(originalTitleRef.current ?? '', titleRef.current || '')
      if (restoredTitle != null)
        doc.title = restoredTitle
    }
  }, [])

  return [title, setTitle]
}
