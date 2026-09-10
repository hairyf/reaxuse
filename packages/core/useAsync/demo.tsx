import { useAsync } from '@reaxuse/core'
import { useState } from 'react'

const LOOKUP_DELAY = 500

const SAMPLE_RESULTS: Record<string, string> = {
  react: 'react — 24M weekly downloads, MIT license',
  vue: 'vue — 5.1M weekly downloads, MIT license',
  vueuse: 'vueuse — 950k weekly downloads, MIT license',
}

export default function UseAsyncDemo() {
  const [term, setTerm] = useState('vueuse')
  // bumping the counter re-runs the lookup without changing the term
  const [refreshTick, setRefreshTick] = useState(0)
  const [evaluating, setEvaluating] = useState(false)

  const value = useAsync(
    (onCancel) => {
      // simulated ~500ms async lookup for the current term
      return new Promise<string>((resolve) => {
        const result = SAMPLE_RESULTS[term] ?? `No results for "${term}"`
        const timer = setTimeout(resolve, LOOKUP_DELAY, result)
        // a newer evaluation (or unmount) forgets this one's timer
        onCancel(() => clearTimeout(timer))
      })
    },
    'Type a term to look it up…',
    {
      deps: [term, refreshTick],
      onEvaluating: setEvaluating,
    },
  )

  return (
    <div>
      <div>
        <input
          type="text"
          value={term}
          onChange={event => setTerm(event.target.value)}
          placeholder="Search term (react / vue / vueuse)"
        />
        {' '}
        <button type="button" onClick={() => setRefreshTick(tick => tick + 1)}>
          Refresh
        </button>
      </div>
      <div>
        value:
        {' '}
        {value}
      </div>
      <div>
        {evaluating ? 'evaluating…' : 'idle'}
      </div>
    </div>
  )
}
