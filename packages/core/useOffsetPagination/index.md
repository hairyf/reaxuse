---
category: Utilities
---

# useOffsetPagination

Reactive offset pagination — React port of VueUse's [`useOffsetPagination`](https://vueuse.org/core/useOffsetPagination/).

**Mapping:** object-mirror hook — `currentPage`/`currentPageSize` are `useState` state (write them through the returned
`setCurrentPage`/`setCurrentPageSize` setters; upstream assigns `currentPage.value` on a Vue ref), `pageCount`/
`isFirstPage`/`isLastPage` are derived on every render (upstream: computed refs), and `prev`/`next` are stable callbacks.
`total`/`pageSize` accept a value, a ref-like (`{ current }`) or a getter (`() => number`); `page` accepts a value or a
ref-like and is kept in two-way sync with the internal state (upstream: `syncRef`). The change callbacks
(`onPageChange`/`onPageSizeChange`/`onPageCountChange`) fire when the corresponding value actually changes and receive a
snapshot of the pagination state.

## Usage

```tsx
import { useOffsetPagination } from '@reaxuse/core'

function fetchData({ currentPage, currentPageSize }: { currentPage: number, currentPageSize: number }) {
  fetch(currentPage, currentPageSize).then((responseData) => {
    setData(responseData)
  })
}

const {
  currentPage,
  currentPageSize,
  pageCount,
  isFirstPage,
  isLastPage,
  prev,
  next,
} = useOffsetPagination({
  total: database.length,
  page: 1,
  pageSize: 10,
  onPageChange: ({ currentPage, currentPageSize }) => fetchData(currentPage, currentPageSize),
  onPageSizeChange: ({ currentPage, currentPageSize }) => fetchData(currentPage, currentPageSize),
})
// note: currentPage/currentPageSize/pageCount are plain numbers — navigate with
// prev/next (or setCurrentPage/setCurrentPageSize)
```

<DemoContainer name="UseOffsetPagination" />

## Type Declarations

```ts
export interface UseOffsetPaginationOptions {
  total?: MaybeRefOrGetter<number>
  pageSize?: MaybeRefOrGetter<number> // @default 10
  page?: MaybeRef<number> // @default 1
  onPageChange?: (returnValue: UseOffsetPaginationReturn) => unknown
  onPageSizeChange?: (returnValue: UseOffsetPaginationReturn) => unknown
  onPageCountChange?: (returnValue: UseOffsetPaginationReturn) => unknown
}

export interface UseOffsetPaginationReturn {
  currentPage: number
  currentPageSize: number
  pageCount: number
  isFirstPage: boolean
  isLastPage: boolean
  prev: () => void
  next: () => void
}

export interface UseOffsetPaginationControls extends UseOffsetPaginationReturn {
  setCurrentPage: Dispatch<SetStateAction<number>>
  setCurrentPageSize: Dispatch<SetStateAction<number>>
}

export function useOffsetPagination(options: Omit<UseOffsetPaginationOptions, 'total'>): UseOffsetPaginationInfinityPageReturn
export function useOffsetPagination(options: UseOffsetPaginationOptions): UseOffsetPaginationControls
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useOffsetPagination/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useOffsetPagination/index.ts) (implementation),
  [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useOffsetPagination/index.browser.test.ts) (mirrored by `useOffsetPagination.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useOffsetPagination/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useOffsetPagination.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useOffsetPagination.ts), docs + demo co-located in `packages/core/useOffsetPagination/`

<Contributors name="useOffsetPagination" />
