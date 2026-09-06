import type { MaybeRef, MaybeRefOrGetter } from '@reaxuse/shared'
import type { Dispatch, SetStateAction } from 'react'
import { clamp, isRefLike, noop, toValue } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseOffsetPaginationOptions {
  /**
   * Total number of items.
   */
  total?: MaybeRefOrGetter<number>

  /**
   * The number of items to display per page.
   * @default 10
   */
  pageSize?: MaybeRefOrGetter<number>

  /**
   * The current page number.
   * @default 1
   */
  page?: MaybeRef<number>

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
 * 2. `total` / `pageSize` accept a plain value, a ref-like (`{ current }`) or
 *    a getter (`() => number`), and `page` accepts a plain value or a
 *    ref-like — all resolved with `toValue` (upstream: `MaybeRefOrGetter`).
 *    A ref-like `page` / `pageSize` is kept in two-way sync with the internal
 *    state, mirroring upstream's `syncRef` (including writing the clamped
 *    value back to the ref-like); external mutations are adopted on the next
 *    render.
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
  const totalRef = useRef(total)
  totalRef.current = total
  const pageSizeRef = useRef(pageSize)
  pageSizeRef.current = pageSize
  const pageRef = useRef(page)
  pageRef.current = page
  const onPageChangeRef = useRef(onPageChange)
  onPageChangeRef.current = onPageChange
  const onPageSizeChangeRef = useRef(onPageSizeChange)
  onPageSizeChangeRef.current = onPageSizeChange
  const onPageCountChangeRef = useRef(onPageCountChange)
  onPageCountChangeRef.current = onPageCountChange

  const isPageRefLike = isRefLike(page)
  const isPageRefLikeRef = useRef(isPageRefLike)
  isPageRefLikeRef.current = isPageRefLike
  const isPageSizeRefLike = isRefLike(pageSize)
  const isPageSizeRefLikeRef = useRef(isPageSizeRefLike)
  isPageSizeRefLikeRef.current = isPageSizeRefLike

  // upstream: currentPageSize = useClamp(pageSize, 1, Infinity)
  const [currentPageSize, setCurrentPageSize] = useState(() => Math.max(1, toValue(pageSizeRef.current)))

  // upstream: pageCount = computed(...)
  const pageCount = Math.max(1, Math.ceil(toValue(totalRef.current) / currentPageSize))
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

  // --- ref-like two-way sync (upstream: syncRef(page/currentPage, 'both')) ---
  // adopt external mutations of a ref-like `page` / `pageSize` on re-render
  useEffect(() => {
    if (isPageRefLikeRef.current) {
      const clamped = clamp((pageRef.current as { current: number }).current, 1, pageCountRef.current)
      setCurrentPage(current => (current === clamped ? current : clamped))
    }
    if (isPageSizeRefLikeRef.current) {
      const clamped = Math.max(1, (pageSizeRef.current as { current: number }).current)
      setCurrentPageSize(current => (current === clamped ? current : clamped))
    }
  })

  // write internal state back to the ref-like (upstream syncRef both directions)
  useEffect(() => {
    if (isPageRefLikeRef.current)
      (pageRef.current as { current: number }).current = currentPage
  }, [currentPage])

  useEffect(() => {
    if (isPageSizeRefLikeRef.current)
      (pageSizeRef.current as { current: number }).current = currentPageSize
  }, [currentPageSize])

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
