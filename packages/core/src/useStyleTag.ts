import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseStyleTagOptions {
  /**
   * Media query for styles to apply
   */
  media?: string

  /**
   * Load the style immediately
   *
   * @default true
   */
  immediate?: boolean

  /**
   * Manual controls the timing of loading and unloading
   *
   * @default false
   */
  manual?: boolean

  /**
   * DOM id of the style tag
   *
   * @default auto-incremented (`reaxuse_styletag_N`)
   */
  id?: string

  /**
   * Nonce value for CSP (Content Security Policy)
   *
   * @default undefined
   */
  nonce?: string

  /**
   * Specify a custom `document` instance, e.g. working with iframes or in
   * testing environments.
   */
  document?: Document
}

export interface UseStyleTagReturn {
  /**
   * DOM id of the style tag
   */
  id: string

  /**
   * Set the CSS text of the style tag — updates the live `<style>` element
   * while loaded, and is stored for the next `load()` otherwise. Upstream
   * returns a writable `css` ref instead (`css.value = '...'`).
   */
  css: (value: string) => void

  /**
   * Inject the style tag into `document.head` (no-op when already loaded)
   */
  load: () => void

  /**
   * Remove the style tag from `document.head` (reference-counted, so style
   * tags shared by id are only removed with the last unloaded instance)
   */
  unload: () => void

  /**
   * Whether the style tag is currently injected
   */
  isLoaded: boolean
}

let _id = 0
const _refCount = new WeakMap<HTMLStyleElement, number>()

/**
 * React port of VueUse's `useStyleTag`.
 *
 * Map from @vueuse/core `useStyleTag`
 * (`source/vueuse/packages/core/useStyleTag/`). Injects a `<style>` element
 * into `document.head` and keeps its text in sync with the given CSS.
 *
 * React divergences:
 * - the initial `css` argument is a plain string, read once like upstream's
 *   initial ref value; updates go through the returned `css` setter —
 *   `css('...')` (upstream: writable ref, `css.value = '...'`);
 * - the `isLoaded` ref return becomes a plain boolean state;
 * - upstream's `watch(cssRef, ..., { immediate: true })` becomes an initial
 *   `el.textContent` write in `load()` plus direct writes from the `css`
 *   setter while loaded;
 * - `tryOnMounted(load)` / `tryOnScopeDispose(unload)` become a mount
 *   `useEffect` whose cleanup calls `unload` (skipped with `manual: true`);
 * - SSR-safe: `document` is only touched inside the mount effect and the
 *   callbacks, never during render — with no `document` available `load()`
 *   and `unload()` are no-ops (upstream's `defaultDocument` guard);
 * - auto-generated ids use the `reaxuse_styletag_` prefix (upstream:
 *   `vueuse_styletag_`).
 *
 * @example
 * const { id, css, load, unload, isLoaded } = useStyleTag('.foo { margin-top: 32px; }')
 * css('.foo { margin-top: 64px; }') // updates the injected <style>
 */
export function useStyleTag(
  css: string,
  options: UseStyleTagOptions = {},
): UseStyleTagReturn {
  const [isLoaded, setIsLoaded] = useState(false)

  // latest-value refs (repo idiom, see useStateManualHistory) so `load`,
  // `unload` and `css` stay stable callbacks that always read the newest
  // values; `isLoadedRef` guards the ref-counting against stale state
  const cssRef = useRef(css)
  const isLoadedRef = useRef(false)
  const optionsRef = useRef(options)
  const idRef = useRef<string>('')
  cssRef.current = css
  optionsRef.current = options
  if (!idRef.current)
    idRef.current = options.id ?? `reaxuse_styletag_${++_id}`

  const resolveDocument = useCallback(() => {
    const doc = optionsRef.current.document
    if (doc)
      return doc
    return typeof document === 'undefined' ? undefined : document
  }, [])

  const load = useCallback(() => {
    const doc = resolveDocument()
    if (!doc)
      return

    const el = (doc.getElementById(idRef.current) || doc.createElement('style')) as HTMLStyleElement

    if (!el.isConnected) {
      el.id = idRef.current
      if (optionsRef.current.nonce)
        el.nonce = optionsRef.current.nonce
      if (optionsRef.current.media)
        el.media = optionsRef.current.media
      doc.head.appendChild(el)
    }

    if (isLoadedRef.current)
      return

    _refCount.set(el, (_refCount.get(el) ?? 0) + 1)

    // upstream: watch(cssRef, el.textContent = value, { immediate: true }) —
    // the immediate write happens here; later writes go through `css`
    el.textContent = cssRef.current
    isLoadedRef.current = true
    setIsLoaded(true)
  }, [resolveDocument])

  const unload = useCallback(() => {
    const doc = resolveDocument()
    if (!doc || !isLoadedRef.current)
      return

    const el = doc.getElementById(idRef.current) as HTMLStyleElement | null
    if (el) {
      const count = (_refCount.get(el) ?? 1) - 1
      if (count <= 0) {
        _refCount.delete(el)
        doc.head.removeChild(el)
      }
      else {
        _refCount.set(el, count)
      }
    }

    isLoadedRef.current = false
    setIsLoaded(false)
  }, [resolveDocument])

  const setCss = useCallback((value: string) => {
    cssRef.current = value
    if (!isLoadedRef.current)
      return
    const doc = resolveDocument()
    const el = doc?.getElementById(idRef.current)
    if (el)
      el.textContent = value
  }, [resolveDocument])

  useEffect(() => {
    const { immediate = true, manual = false } = optionsRef.current
    if (immediate && !manual)
      load()
    return () => {
      if (!manual)
        unload()
    }
  }, [load, unload])

  return {
    id: idRef.current,
    css: setCss,
    load,
    unload,
    isLoaded,
  }
}
