import { useQuery } from '@reause/core'
import { useState } from 'react'

export default function UseQueryDemo() {
  const [page, setPage] = useQuery('page', '1', { transform: Number })
  // `T` is inferred from the default, so a `''` literal would narrow the
  // setter to `(value: '') => void` — pin `T` to `string` explicitly
  const [search, setSearch] = useQuery<string>('search', '')
  const [pageDraft, setPageDraft] = useState(1)
  const [searchDraft, setSearchDraft] = useState('')

  return (
    <div>
      <p>
        {'Page: '}
        <code>{page}</code>
      </p>
      <p>
        {'Search: '}
        <code>{search || '(empty)'}</code>
      </p>
      <p>
        <input
          type="number"
          value={pageDraft}
          onChange={event => setPageDraft(Number(event.target.value))}
        />
        <button type="button" onClick={() => setPage(pageDraft)}>setPage</button>
        <button type="button" onClick={() => setPage(1)}>reset to default</button>
      </p>
      <p>
        <input
          type="text"
          placeholder="foobar"
          value={searchDraft}
          onChange={event => setSearchDraft(event.target.value)}
        />
        <button type="button" onClick={() => setSearch(searchDraft)}>setSearch</button>
        <button type="button" onClick={() => setSearch('')}>clear</button>
      </p>
      <p>
        The values stay in sync with the address bar: edit the query string
        directly or use the back/forward buttons.
      </p>
    </div>
  )
}
