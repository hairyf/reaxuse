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

## Source Forms

`total` and `pageSize` are read-only value sources and take plain numbers (upstream:
`MaybeRefOrGetter<number>`) — only their initial value is adopted. `page` is controllable (the hook
writes it back), so it accepts a React `State<number>`:

```tsx
const [page, setPage] = useState(1)

const pagination = useOffsetPagination({
  total: 40, // plain number
  pageSize: 10, // plain number
  page, // state value — external updates are adopted, navigation writes back
})
```

`page` also accepts a getter, a React ref (`{ current }`), a `[value, setter]` tuple or a
`{ value, onChange }` pair. A reactive `page` is kept in two-way sync with the internal state
(upstream's `syncRef`); the tuple and `{ value, onChange }` forms are the React state protocol and
have no upstream equivalent.
