import { usePrevious } from '@reaxuse/core'
import { useState } from 'react'

export default function UsePreviousDemo() {
  const [counter, setCounter] = useState(0)
  const previous = usePrevious(counter)

  return (
    <div>
      <p>
        {'counter: '}
        <strong>{counter}</strong>
      </p>
      <p>
        {'previous: '}
        <strong>{previous ?? 'undefined'}</strong>
      </p>
      <button onClick={() => setCounter(c => c + 1)}>+1</button>
    </div>
  )
}
