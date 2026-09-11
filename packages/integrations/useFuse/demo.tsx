// Relative (not `@reause/integrations`): the package name resolves through the
// worktree node_modules junction to the main repo's integrations package, which
// does not export `useFuse` until this PR is merged.
import type { UseFuseOptions } from '../useFuse'
import { useMemo, useState } from 'react'
import { useFuse } from '../useFuse'

interface DataItem {
  firstName: string
  lastName: string
}

const data: DataItem[] = [
  { firstName: 'Roslyn', lastName: 'Mitchell' },
  { firstName: 'Cathleen', lastName: 'Matthews' },
  { firstName: 'Carleton', lastName: 'Harrelson' },
  { firstName: 'Allen', lastName: 'Moores' },
  { firstName: 'John', lastName: 'Washington' },
  { firstName: 'Brooke', lastName: 'Colton' },
  { firstName: 'Mary', lastName: 'Rennold' },
  { firstName: 'Nanny', lastName: 'Field' },
  { firstName: 'Chasity', lastName: 'Michael' },
  { firstName: 'Oakley', lastName: 'Giles' },
  { firstName: 'Johanna', lastName: 'Shepherd' },
  { firstName: 'Maybelle', lastName: 'Wilkie' },
  { firstName: 'Dawson', lastName: 'Rowntree' },
  { firstName: 'Manley', lastName: 'Pond' },
  { firstName: 'Lula', lastName: 'Sawyer' },
  { firstName: 'Hudson', lastName: 'Hext' },
  { firstName: 'Alden', lastName: 'Senior' },
  { firstName: 'Tory', lastName: 'Hyland' },
  { firstName: 'Constance', lastName: 'Josephs' },
  { firstName: 'Larry', lastName: 'Kinsley' },
]

type FilterBy = 'both' | 'first' | 'last'

export default function UseFuseDemo() {
  const [search, setSearch] = useState('')
  const [filterBy, setFilterBy] = useState<FilterBy>('both')
  const [resultLimit, setResultLimit] = useState<number | undefined>(undefined)
  const [resultLimitString, setResultLimitString] = useState('')
  const [exactMatch, setExactMatch] = useState(false)
  const [isCaseSensitive, setIsCaseSensitive] = useState(false)
  const [matchAllWhenSearchEmpty, setMatchAllWhenSearchEmpty] = useState(true)

  // `options` is memoized (upstream: a `computed`) so the Fuse index is only
  // rebuilt when a control actually changes — a fresh `fuseOptions` object on
  // every render would rebuild it, which is correct but slower.
  const options = useMemo<UseFuseOptions<DataItem>>(() => ({
    fuseOptions: {
      keys: filterBy === 'first'
        ? ['firstName']
        : filterBy === 'last' ? ['lastName'] : ['firstName', 'lastName'],
      isCaseSensitive,
      threshold: exactMatch ? 0 : undefined,
    },
    resultLimit,
    matchAllWhenSearchEmpty,
  }), [filterBy, isCaseSensitive, exactMatch, resultLimit, matchAllWhenSearchEmpty])

  const { results } = useFuse(search, data, options)

  // upstream normalizes the raw string in a `watch`; here the input handler does it
  function onResultLimitChange(value: string) {
    if (value === '') {
      setResultLimit(undefined)
      setResultLimitString('')
      return
    }
    const float = Number.parseFloat(value)
    if (!Number.isNaN(float)) {
      const rounded = Math.round(float)
      setResultLimit(rounded)
      setResultLimitString(rounded.toString())
    }
  }

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Search for someone..."
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
        <div>
          <select value={filterBy} onChange={event => setFilterBy(event.target.value as FilterBy)}>
            <option value="both">Full Name</option>
            <option value="first">First Name</option>
            <option value="last">Last Name</option>
          </select>
          <label>
            <input
              type="number"
              min="0"
              placeholder="Result limit"
              value={resultLimitString}
              onChange={event => onResultLimitChange(event.target.value)}
            />
            <span>Result limit</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={exactMatch}
              onChange={event => setExactMatch(event.target.checked)}
            />
            <span>Exact Match</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={isCaseSensitive}
              onChange={event => setIsCaseSensitive(event.target.checked)}
            />
            <span>Case Sensitive</span>
          </label>
          <label>
            <input
              type="checkbox"
              checked={matchAllWhenSearchEmpty}
              onChange={event => setMatchAllWhenSearchEmpty(event.target.checked)}
            />
            <span>Match all when empty</span>
          </label>
        </div>
      </div>
      <div>
        {results.length > 0
          ? results.map(result => (
              <div key={`${result.item.firstName}${result.item.lastName}`}>
                <div>
                  <span>
                    {result.item.firstName}
                    {' '}
                    {result.item.lastName}
                  </span>
                  <span>
                    Score Index:
                    {' '}
                    {result.refIndex}
                  </span>
                </div>
              </div>
            ))
          : <div>No Results Found</div>}
      </div>
    </div>
  )
}
