import type { MaybeRefOrGetter } from '@reaxuse/shared'
import { deepClone, deepEqual, isRefLike, toValue } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseClonedOptions<T = any> {
  /**
   * Custom clone function.
   *
   * By default, it use `JSON.parse(JSON.stringify(value))` to clone.
   */
  clone?: (source: T) => T

  /**
   * Manually sync the clone — only `sync()` re-clones from the source.
   *
   * @default false
   */
  manual?: boolean

  /**
   * Track changes inside the source value, not only reference replacements
   * (upstream: watch option `deep`). When `false`, a new reference is needed
   * to re-sync — in-place mutations are ignored.
   *
   * @default true
   */
  deep?: boolean

  /**
   * Sync the clone on mount.
   *
   * @default true
   */
  immediate?: boolean
}

export interface UseClonedReturn<T> {
  /**
   * Cloned value — React state holding a (deep) copy of the source.
   */
  cloned: T
  /**
   * Whether the cloned value has been modified since the last sync.
   */
  isModified: boolean
  /**
   * Sync cloned data with source manually
   */
  sync: () => void
}

export type CloneFn<F, T = F> = (x: F) => T

export function cloneFnJSON<T>(source: T): T {
  return JSON.parse(JSON.stringify(source))
}

/**
 * React port of VueUse's `useCloned`.
 *
 * Map from @vueuse/core `useCloned`
 * (`source/vueuse/packages/core/useCloned/`). Returns a deep clone of the
 * source as state — `{ cloned, sync, isModified }`, mirroring the upstream
 * object return. The clone follows the source automatically: it re-syncs
 * whenever the resolved source changes, unless `manual` is set.
 *
 * React divergences:
 * - upstream's writable `Ref<T>` becomes a plain state value. Edit the clone
 *   in place and the modification is picked up on the next render
 *   (structural comparison — upstream: `watch(cloned, ..., { deep: true })`),
 *   flipping `isModified` to `true`; `sync()` re-clones from the source and
 *   resets it;
 * - the source watcher becomes an effect comparing the resolved source
 *   against an isolated snapshot of the last synced source on every render:
 *   `deep: true` re-syncs on structural change, `deep: false` only when the
 *   reference was replaced. A plain value is re-evaluated every render like
 *   any React argument, so it re-syncs when it changes between renders
 *   (upstream only watches refs and getters — plain values are static there);
 * - `immediate: false` skips the initial sync and `cloned` starts as `{}`
 *   (upstream initializes the clone ref to `{}` and lets the watch fill it);
 * - Vue watch options with no React equivalent are omitted (`flush`,
 *   `onTrack`, `onTrigger`). Getter sources should return a stable reference
 *   — with `deep: false` a getter producing a brand-new object every call
 *   re-syncs on every render.
 *
 * @example
 * const { cloned, isModified, sync } = useCloned(original)
 *
 * cloned.key = 'new value' // next render sets isModified to true
 * sync() // re-clone from the source, isModified back to false
 */
export function useCloned<T>(
  source: MaybeRefOrGetter<T>,
  options: UseClonedOptions<T> = {},
): UseClonedReturn<T> {
  // upstream destructures its options once at setup — captured here the same
  // way (a changing `options` object between renders does not re-wire the hook)
  const optionsRef = useRef(options)
  const {
    manual = false,
    clone = cloneFnJSON,
    deep = true,
    immediate = true,
  } = optionsRef.current

  // latest source synced each render so the stable `sync` callback always
  // reads the newest source (house pattern)
  const sourceRef = useRef(source)
  sourceRef.current = source

  // upstream: `cloned` initializes as `{}` and is filled right away by the
  // immediate watch — or by the unconditional setup `sync()` for `manual` /
  // plain-value sources. With `immediate: false` no initial sync happens and
  // `cloned` keeps the empty initial value
  const isReactiveSource = isRefLike(source) || typeof source === 'function'
  const initialSync = manual || !isReactiveSource || immediate

  const [cloned, setCloned] = useState<T>(() => {
    if (!initialSync)
      return {} as T
    return clone(toValue(sourceRef.current))
  })
  const [isModified, setIsModified] = useState(false)

  // isolated baselines for the two detectors below — deep copies, so an
  // in-place mutation of the live source (or of `cloned`) stays visible to
  // the comparison. `deep: false` compares source references, which is safe
  // against a shared baseline by design (mutations must NOT re-sync)
  const sourceBaselineRef = useRef<T>(undefined as unknown as T)
  const clonedBaselineRef = useRef<T>(undefined as unknown as T)
  const baselineInitRef = useRef(false)
  if (!baselineInitRef.current) {
    baselineInitRef.current = true
    clonedBaselineRef.current = deepClone(cloned)
    sourceBaselineRef.current = deep
      ? deepClone(toValue(sourceRef.current))
      : toValue(sourceRef.current)
  }

  const sync = useCallback(() => {
    const current = toValue(sourceRef.current)
    const next = clone(current)
    // refresh the isolated baselines so the next render sees an unmodified
    // clone and an up-to-date source (upstream: `_lastSync` flag)
    sourceBaselineRef.current = deep ? deepClone(current) : current
    clonedBaselineRef.current = deepClone(next)
    setCloned(next)
    setIsModified(false)
  }, [clone, deep])

  // modification detector (upstream: `watch(cloned, cb, { deep: true,
  // flush: 'sync' })`) — runs after every render comparing the clone against
  // its last-synced snapshot: React has no way to observe in-place mutations
  // except by re-comparing on a re-render
  useEffect(() => {
    if (!deepEqual(cloned, clonedBaselineRef.current))
      setIsModified(true)
  })

  // source watcher (upstream: `watch(source, sync, { deep, immediate })`) —
  // re-sync whenever the resolved source changed since the last sync:
  // structural comparison for `deep: true`, reference comparison for `false`
  useEffect(() => {
    if (manual)
      return
    const value = toValue(sourceRef.current)
    const changed = deep
      ? !deepEqual(value, sourceBaselineRef.current)
      : !Object.is(value, sourceBaselineRef.current)
    if (changed)
      sync()
  })

  return { cloned, isModified, sync }
}
