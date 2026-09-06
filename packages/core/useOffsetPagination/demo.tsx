import { useOffsetPagination } from '@reaxuse/core'
import { useEffect, useState } from 'react'

interface User {
  id: number
  name: string
}

const database: User[] = Array.from({ length: 80 }, (_, i) => ({ id: i, name: `user ${i}` }))

function fetch(page: number, pageSize: number) {
  return new Promise<User[]>((resolve) => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    setTimeout(() => {
      resolve(database.slice(start, end))
    }, 100)
  })
}

export default function UseOffsetPaginationDemo() {
  const [data, setData] = useState<User[]>([])

  function fetchData(page: number, pageSize: number) {
    fetch(page, pageSize).then(setData)
  }

  const {
    currentPage,
    currentPageSize,
    pageCount,
    isFirstPage,
    isLastPage,
    prev,
    next,
    setCurrentPage,
  } = useOffsetPagination({
    total: database.length,
    page: 1,
    pageSize: 10,
    onPageChange: ({ currentPage, currentPageSize }) => fetchData(currentPage, currentPageSize),
    onPageSizeChange: ({ currentPage, currentPageSize }) => fetchData(currentPage, currentPageSize),
  })

  // initial fetch (upstream: fetchData({ currentPage: 1, currentPageSize: 10 }) on setup)
  useEffect(() => {
    fetch(1, 10).then(setData)
  }, [])

  return (
    <div>
      <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(2, auto)', gap: '4px 16px', alignItems: 'center' }}>
        <div style={{ opacity: 0.5 }}>
          total:
        </div>
        <div>{database.length}</div>
        <div style={{ opacity: 0.5 }}>
          pageCount:
        </div>
        <div>{pageCount}</div>
        <div style={{ opacity: 0.5 }}>
          currentPageSize:
        </div>
        <div>{currentPageSize}</div>
        <div style={{ opacity: 0.5 }}>
          currentPage:
        </div>
        <div>{currentPage}</div>
        <div style={{ opacity: 0.5 }}>
          isFirstPage:
        </div>
        <div>{isFirstPage.toString()}</div>
        <div style={{ opacity: 0.5 }}>
          isLastPage:
        </div>
        <div>{isLastPage.toString()}</div>
      </div>

      <div style={{ margin: '16px 0' }}>
        <button type="button" disabled={isFirstPage} onClick={prev}>
          prev
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map(item => (
          <button
            key={item}
            type="button"
            disabled={currentPage === item}
            onClick={() => setCurrentPage(item)}
          >
            {item}
          </button>
        ))}
        <button type="button" disabled={isLastPage} onClick={next}>
          next
        </button>
      </div>

      <table style={{ margin: 'auto' }}>
        <thead>
          <tr>
            <td>id</td>
            <td>name</td>
          </tr>
        </thead>
        <tbody>
          {data.map(d => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
