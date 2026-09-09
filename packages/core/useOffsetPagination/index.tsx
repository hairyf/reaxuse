import type { State } from '@reaxuse/shared'
import type { Dispatch, SetStateAction } from 'react'
import { clamp, isRefLike, noop, toValue } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Whether a `State<T>` source is reactive — ref-like objects, getters,
 * `[value, setter]` tuples and `{ value, onChange }` pairs can all change
 * without the caller passing a new plain value. A plain value is static for
 * the lifetime of the hook unless the caller re-renders with a new one.
 */
function isReactiveState<T>(source: State<T> | undefined | null): boolean {
  if (source === null || source === undefined)
    return false
  if (typeof source === 'function')
    return true
  if (isRefLike(source as object))
    return true
  if (Array.isArray(source) && source.length === 2 && typeof source[1] === 'function')
    return true
  return typeof source === 'object'
    && !Array.isArray(source)
    && 'value' in source
    // mirrors `toValue`: a DOM-like `{ value }` (an input element) is a plain
    // value, not a `{ value, onChange }` state pair
    && !('addEventListener' in source)
}

/**
 * Write a value back through a writable `State<T>` source — a ref-like
 * `.current`, a `[value, setter]` tuple or a `{ value, onChange }` pair.
 * Plain values and getters have no write path (upstream's `syncRef` only ever
 * writes the Vue ref it was given).
 */
function writeState<T>(source: State<T> | undefined | null, value: T): void {
  if (source === null || source === undefined)
    return
  if (Array.isArray(source) && source.length === 2 && typeof source[1] === 'function') {
    (source as unknown as readonly [T, (next: T) => void])[1](value)
    return
  }
  if (isRefLike(source as object)) {
    (source as { current: T }).current = value
    return
  }
  if (typeof source === 'object' && !Array.isArray(source)
    && 'value' in source && !('addEventListener' in source)) {
    (source as { onChange?: (next: T) => void }).onChange?.(value)
  }
}

export interface UseOffsetPaginationOptions {
  /**
   * Total number of items. A read-only value source — pass a plain number
   * (upstream: `MaybeRefOrGetter<number>`; resolve a React ref or getter at
   * the call site).
   */
  total?: number

  /**
   * The number of items to display per page. A read-only value source — pass
   * a plain number (upstream: `MaybeRefOrGetter<number>`; resolve a React ref
   * or getter at the call site). Only the initial value is adopted; navigate
   * with `setCurrentPageSize`.
   * @default 10
   */
  pageSize?: number

  /**
   * The current page number. Controllable — the hook writes it back, so it
   * accepts a React `State<number>`: a plain number, a getter, a React ref
   * (`{ current }`), a `[value, setter]` state tuple or a `{ value, onChange }`
   * pair — resolved with `toValue`.
   * @default 1
   */
  page?: State<number>

  /**
   * Callback when the `page` change.
   */
  onPageChange?: (returnValue: UseOffsetPaginationReturn) => unknown

  /**
   * Callback when the `pageSize` change.
   */
  onPageSizeChange?: (returnValue: UseOffsetPaginationReturn) => unknown

  /**
   * Callback when the `pageCount` change.
   */
  onPageCountChange?: (returnValue: UseOffsetPaginationReturn) => unknown
}

export interface UseOffsetPaginationReturn {
  /** Current page number, clamped to `[1, pageCount]`. */
  currentPage: number
  /** Current number of items displayed per page, clamped to `>= 1`. */
  currentPageSize: number
  /** Total number of pages. */
  pageCount: number
  /** Whether the current page is the first one. */
  isFirstPage: boolean
  /** Whether the current page is the last one. */
  isLastPage: boolean
  /** Go to the previous page (no-op on the first page). */
  prev: () => void
  /** Go to the next page (no-op on the last page). */
  next: () => void
}

export interface UseOffsetPaginationControls extends UseOffsetPaginationReturn {
  /**
   * Set the current page directly, clamped to `[1, pageCount]`. React
   * addition — upstream assigns `currentPage.value = n` on a Vue ref.
   */
  setCurrentPage: Dispatch<SetStateAction<number>>
  /**
   * Set the current page size directly, clamped to `>= 1`. React addition —
   * upstream assigns `currentPageSize.value = n` on a Vue ref.
   */
  setCurrentPageSize: Dispatch<SetStateAction<number>>
}

export type UseOffsetPaginationInfinityPageReturn = Omit<UseOffsetPaginationControls, 'isLastPage'>

/**
 * React port of VueUse's `useOffsetPagination`.
 *
 * Map from @vueuse/core `useOffsetPagination`
 * (`source/vueuse/packages/core/useOffsetPagination/`). Reactive offset
 * pagination — navigate a page window over a `total` item count with
 * `prev`/`next`, read the derived `pageCount` / `isFirstPage` / `isLastPage`,
 * and observe changes through the `onPageChange` / `onPageSizeChange` /
 * `onPageCountChange` callbacks.
 *
 * Adjustments from upstream (Vue reactivity does not translate 1:1):
 *
 * 1. The returned object mirrors `UseOffsetPaginationReturn` member for
 *    member, but Vue refs/computed become plain React values — `currentPage`
 *    and `currentPageSize` are `useState` state (write them through the
 *    returned `setCurrentPage` / `setCurrentPageSize` setters; upstream
 *    assigns `currentPage.value` / `currentPageSize.value` directly), while
 *    `pageCount` / `isFirstPage` / `isLastPage` are derived on every render
 *    (upstream: computed refs).
 * 2. `total` and `pageSize` are read-only value sources and take plain
 *    numbers (upstream: `MaybeRefOrGetter<number>`; resolve a React ref or
 *    getter at the call site) — only their initial value is adopted.
 *    `page` is controllable (the hook writes it), so it accepts a React
 *    `State<number>` — a plain number, a getter, a React ref (`{ current }`),
 *    a `[value, setter]` state tuple or a `{ value, onChange }` pair — all
 *    resolved with `toValue` (upstream: `MaybeRef<number>`; the tuple and
 *    `{ value, onChange }` forms are the React state protocol and have no
 *    upstream equivalent). A reactive `page` is kept in two-way sync with the
 *    internal state, mirroring upstream's `syncRef` (including writing the
 *    clamped value back through the ref-like `.current`, the tuple setter or
 *    the pair's `onChange`); external mutations are adopted on the next render.
 * 3. Change callbacks fire when the corresponding value actually changes
 *    (never on the initial render), receiving a snapshot of the pagination
 *    state — upstream fires them through `watch` with the reactive return
 *    object. The snapshot contains the upstream members only (no setters).
 * 4. Upstream's `useClamp` (packages/math) is inlined — the page/pageSize
 *    clamp to `[1, pageCount]` / `[1, Infinity]`, and when `total` is
 *    omitted `pageCount` is `Infinity` (`isLastPage` stays `false`).
 *
 * @example
 * const {
 *   currentPage,
 *   currentPageSize,
 *   pageCount,
 *   isFirstPage,
 *   isLastPage,
 *   prev,
 *   next,
 * } = useOffsetPagination({
 *   total: 40,
 *   page: 1,
 *   pageSize: 10,
 *   onPageChange: ({ currentPage, currentPageSize }) => fetchData(currentPage, currentPageSize),
 * })
 */
export function useOffsetPagination(options: Omit<UseOffsetPaginationOptions, 'total'>): UseOffsetPaginationInfinityPageReturn
export function useOffsetPagination(options: UseOffsetPaginationOptions): UseOffsetPaginationControls
export function useOffsetPagination(options: UseOffsetPaginationOptions): UseOffsetPaginationControls {
  const {
    total = Number.POSITIVE_INFINITY,
    pageSize = 10,
    page = 1,
    onPageChange = noop,
    onPageSizeChange = noop,
    onPageCountChange = noop,
  } = options

  // latest-value refs so stable callbacks and effects always read current options
  const pageRef = useRef(page)
  pageRef.current = page
  const onPageChangeRef = useRef(onPageChange)
  onPageChangeRef.current = onPageChange
  const onPageSizeChangeRef = useRef(onPageSizeChange)
  onPageSizeChangeRef.current = onPageSizeChange
  const onPageCountChangeRef = useRef(onPageCountChange)
  onPageCountChangeRef.current = onPageCountChange

  const isPageReactive = isReactiveState(page)
  const isPageReactiveRef = useRef(isPageReactive)
  isPageReactiveRef.current = isPageReactive

  // upstream: currentPageSize = useClamp(pageSize, 1, Infinity) — `pageSize`
  // is a read-only value source, so only the initial value is adopted
  const [currentPageSize, setCurrentPageSize] = useState(() => Math.max(1, pageSize))

  // upstream: pageCount = computed(...)
  const pageCount = Math.max(1, Math.ceil(total / currentPageSize))
  const pageCountRef = useRef(pageCount)
  pageCountRef.current = pageCount

  // upstream: currentPage = useClamp(page, 1, pageCount)
  const [currentPage, setCurrentPage] = useState(() => clamp(toValue(pageRef.current), 1, pageCount))

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === pageCount

  // --- controls (React additions — upstream writes the Vue refs directly) ---
  const setCurrentPageControl = useCallback((value: SetStateAction<number>) => {
    setCurrentPage((current) => {
      const next = typeof value === 'function' ? value(current) : value
      const clamped = clamp(next, 1, pageCountRef.current)
      return current === clamped ? current : clamped
    })
  }, [])

  const setCurrentPageSizeControl = useCallback((value: SetStateAction<number>) => {
    setCurrentPageSize((current) => {
      const next = typeof value === 'function' ? value(current) : value
      const clamped = Math.max(1, next)
      return current === clamped ? current : clamped
    })
  }, [])

  const prev = useCallback(() => {
    setCurrentPage(current => Math.max(1, current - 1))
  }, [])

  const next = useCallback(() => {
    setCurrentPage(current => Math.min(pageCountRef.current, current + 1))
  }, [])

  // snapshot handed to the change callbacks — mirrors upstream's
  // `reactive(returnValue)` (upstream members only, no setters)
  const returnValue: UseOffsetPaginationReturn = {
    currentPage,
    currentPageSize,
    pageCount,
    isFirstPage,
    isLastPage,
    prev,
    next,
  }
  const returnValueRef = useRef(returnValue)
  returnValueRef.current = returnValue

  // --- controllable `page` two-way sync (upstream: syncRef(page/currentPage, 'both')) ---
  // A single reconciliation runs after every render: a source value we did not
  // write ourselves is adopted, otherwise an internal change is written back.
  // Two independent effects (adopt + write-back) would ping-pong, because the
  // adoption effect always runs before the write-back effect in the same
  // commit and each would see the other's stale value.
  const lastSyncedPageRef = useRef<number>(currentPage)
  useEffect(() => {
    if (!isPageReactiveRef.current)
      return

    const rawSource = toValue(pageRef.current)
    const sourceValue = clamp(rawSource, 1, pageCountRef.current)
    if (sourceValue !== lastSyncedPageRef.current) {
      // external mutation → adopt it and normalize the source
      lastSyncedPageRef.current = sourceValue
      setCurrentPage(sourceValue)
      writeState(pageRef.current, sourceValue)
      return
    }
    if (currentPage !== lastSyncedPageRef.current) {
      // internal change → write it back through the source
      lastSyncedPageRef.current = currentPage
      writeState(pageRef.current, currentPage)
      return
    }
    if (rawSource !== currentPage) {
      // an out-of-range source value is normalized to the clamped page
      writeState(pageRef.current, currentPage)
    }
  })

  // clamp currentPage down when pageCount shrinks (upstream useClamp bound)
  useEffect(() => {
    setCurrentPage(current => Math.min(current, pageCountRef.current))
  }, [pageCount])

  // --- change callbacks (upstream: watch(...)) — skip the initial value ---
  const prevCurrentPageRef = useRef(currentPage)
  useEffect(() => {
    const prev = prevCurrentPageRef.current
    prevCurrentPageRef.current = currentPage
    if (prev !== currentPage)
      onPageChangeRef.current(returnValueRef.current)
  }, [currentPage])

  const prevCurrentPageSizeRef = useRef(currentPageSize)
  useEffect(() => {
    const prev = prevCurrentPageSizeRef.current
    prevCurrentPageSizeRef.current = currentPageSize
    if (prev !== currentPageSize)
      onPageSizeChangeRef.current(returnValueRef.current)
  }, [currentPageSize])

  const prevPageCountRef = useRef(pageCount)
  useEffect(() => {
    const prev = prevPageCountRef.current
    prevPageCountRef.current = pageCount
    if (prev !== pageCount)
      onPageCountChangeRef.current(returnValueRef.current)
  }, [pageCount])

  return {
    ...returnValue,
    setCurrentPage: setCurrentPageControl,
    setCurrentPageSize: setCurrentPageSizeControl,
  }
}
