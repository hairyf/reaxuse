---
category: Utilities
---

# useOffsetPagination

Reactive offset pagination

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
