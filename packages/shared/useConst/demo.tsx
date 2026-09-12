import { useConst } from '@reause/shared'
import { useState } from 'react'

let factoryCalls = 0

/**
 * An "expensive" initial computation — the demo reports which call produced
 * the kept value, so the once-only evaluation is visible next to the
 * re-render counter.
 */
function createOptions() {
  factoryCalls += 1
  return { call: factoryCalls, id: Math.random().toString(36).slice(2, 8) }
}

export default function UseConstDemo() {
  const [renders, setRenders] = useState(1)
  // the factory runs once, on the first render: `options` keeps its identity
  // across every later render, so its call number never changes
  const options = useConst(createOptions)

  return (
    <div>
      <p>
        The factory ran
        {' '}
        <strong>{options.call}</strong>
        {' '}
        time(s) and the same value was kept across
        {' '}
        <strong>{renders}</strong>
        {' '}
        render(s).
      </p>
      <p>
        value:
        {' '}
        <code>
          call #
          {options.call}
          {' '}
          (id
          {' '}
          {options.id}
          )
        </code>
      </p>
      <button type="button" onClick={() => setRenders(renders + 1)}>
        Re-render
      </button>
    </div>
  )
}
