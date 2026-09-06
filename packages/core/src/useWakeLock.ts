import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Specify a custom `navigator` or `document` instance, e.g. working with
 * iframes or in testing environments.
 *
 * Upstream composes these from the shared `ConfigurableNavigator` /
 * `ConfigurableDocument` option types; they are inlined here so this module
 * exports no same-named types (`export *` in `index.ts` would collide with
 * other hooks, TS2308).
 */
export interface UseWakeLockOptions {
  /**
   * Specify a custom `navigator` instance, e.g. working with iframes or in
   * testing environments.
   *
   * @default typeof navigator !== 'undefined' ? navigator : undefined
   */
  navigator?: Navigator
  /**
   * Specify a custom `document` instance, e.g. working with iframes or in
   * testing environments.
   *
   * @default typeof document !== 'undefined' ? document : undefined
   */
  document?: Document
}

export interface UseWakeLockReturn {
  /**
   * The current `WakeLockSentinel` instance, or `null` when no wake lock is
   * held.
   */
  sentinel: WakeLockSentinel | null
  /**
   * If the Wake Lock API is supported by the current navigator.
   */
  isSupported: boolean
  /**
   * Whether a wake lock is currently held and the document is visible.
   */
  isActive: boolean
  /**
   * Request a wake lock of the given type. When the document is hidden, the
   * request is queued and replayed once the document becomes visible.
   */
  request: (type: WakeLockType) => Promise<void>
  /**
   * Request a wake lock immediately, even if the document is hidden. Note
   * that this may throw an error if the document is hidden.
   */
  forceRequest: (type: WakeLockType) => Promise<void>
  /**
   * Release the wake lock. A queued (not yet replayed) request is canceled.
   */
  release: () => Promise<void>
}

/**
 * React port of VueUse's `useWakeLock`.
 *
 * Map from @vueuse/core `useWakeLock`
 * (`source/vueuse/packages/core/useWakeLock/`). Reactive Screen Wake Lock
 * API — prevents devices from dimming or locking the screen.
 *
 * The upstream return shape is mirrored 1:1 as a plain object: `sentinel`,
 * `isSupported` and `isActive` are plain values, while `request`,
 * `forceRequest` and `release` are stable functions.
 *
 * React divergences:
 * - the Vue `shallowRef`/`computed` returns become plain state values;
 *   `request`/`forceRequest`/`release` are stable `useCallback` functions
 *   reading sync refs (`sentinelRef`/`visibilityRef`/`navigatorRef`) the way
 *   upstream reads its refs at call time;
 * - `isSupported` is computed in a mount effect (upstream: `useSupported`),
 *   so SSR renders `false` and the global `navigator` is never touched
 *   during render;
 * - `document.visibilityState` tracking (upstream: `useDocumentVisibility`)
 *   and the queued-request replay (upstream: `whenever`) live in
 *   self-contained `useEffect`s; the initial visibility defaults to
 *   `'visible'` (upstream's server default) and syncs on mount;
 * - the sentinel `release` listener re-queues the released sentinel's type
 *   only while it is still the current sentinel — upstream achieves the
 *   same by re-binding its listener through the sentinel ref;
 * - auto-release on unmount mirrors upstream's `tryOnScopeDispose`;
 * - `WakeLockSentinel`/`WakeLockType` are referenced from lib.dom directly
 *   (upstream defines its own interfaces for older TS libs) and are not
 *   re-exported.
 *
 * @example
 * const { isSupported, isActive, request, release } = useWakeLock()
 */
export function useWakeLock(options: UseWakeLockOptions = {}): UseWakeLockReturn {
  const [sentinel, setSentinel] = useState<WakeLockSentinel | null>(null)
  // Upstream's internal `requestedType` shallowRef (`WakeLockType | false`):
  // a queued request waiting for the document to become visible.
  const [requestedType, setRequestedType] = useState<WakeLockType | false>(false)
  const [isSupported, setIsSupported] = useState(false)
  const [documentVisibility, setDocumentVisibility] = useState<DocumentVisibilityState>('visible')

  // Sync mirrors of the state above, read inside stable callbacks (upstream
  // mutates and reads its refs directly; React state is only updated
  // alongside them for rendering).
  const navigatorRef = useRef<Navigator | undefined>(undefined)
  const sentinelRef = useRef<WakeLockSentinel | null>(null)
  const visibilityRef = useRef<DocumentVisibilityState>('visible')

  // Resolve the navigator and compute support after mount (upstream:
  // `useSupported(() => navigator && 'wakeLock' in navigator)`).
  useEffect(() => {
    const nav = options.navigator ?? (typeof navigator === 'undefined' ? undefined : navigator)
    navigatorRef.current = nav
    setIsSupported(Boolean(nav && 'wakeLock' in nav))
  }, [options.navigator])

  // Track `document.visibilityState` (upstream: `useDocumentVisibility`).
  useEffect(() => {
    const doc = options.document ?? (typeof document === 'undefined' ? undefined : document)
    if (!doc)
      return

    const update = () => {
      visibilityRef.current = doc.visibilityState
      setDocumentVisibility(doc.visibilityState)
    }
    update()

    doc.addEventListener('visibilitychange', update, { passive: true })
    return () => {
      doc.removeEventListener('visibilitychange', update)
    }
  }, [options.document])

  const forceRequest = useCallback(async (type: WakeLockType) => {
    await sentinelRef.current?.release()
    const nav = navigatorRef.current
    const next = nav && 'wakeLock' in nav
      ? await nav.wakeLock.request(type)
      : null
    sentinelRef.current = next
    setSentinel(next)
  }, [])

  // When a sentinel is released by the system (not manually through
  // `release()`), re-queue its type so the wake lock is re-requested when
  // the document becomes visible again (upstream: `useEventListener`).
  useEffect(() => {
    if (!sentinel)
      return

    const onRelease = () => {
      setRequestedType(sentinelRef.current === sentinel ? sentinel.type : false)
    }
    sentinel.addEventListener('release', onRelease, { passive: true })
    return () => {
      sentinel.removeEventListener('release', onRelease)
    }
  }, [sentinel])

  // Upstream: `whenever(...)` — replay a queued request once the document
  // is visible again.
  useEffect(() => {
    if (!isSupported || documentVisibility !== 'visible' || !requestedType)
      return

    const doc = options.document ?? (typeof document === 'undefined' ? undefined : document)
    if (doc?.visibilityState !== 'visible')
      return

    setRequestedType(false)
    void forceRequest(requestedType)
  }, [documentVisibility, forceRequest, isSupported, options.document, requestedType])

  const request = useCallback(async (type: WakeLockType) => {
    if (visibilityRef.current === 'visible')
      await forceRequest(type)
    else
      setRequestedType(type)
  }, [forceRequest])

  const release = useCallback(async () => {
    setRequestedType(false)
    const s = sentinelRef.current
    sentinelRef.current = null
    setSentinel(null)
    await s?.release()
  }, [])

  // Upstream: `tryOnScopeDispose(() => release())` — auto-release on
  // unmount.
  useEffect(() => {
    return () => {
      void release()
    }
  }, [release])

  return {
    sentinel,
    isSupported,
    isActive: !!sentinel && documentVisibility === 'visible',
    request,
    forceRequest,
    release,
  }
}
