import { useDebounceFn } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseDebounceFnDemo() {
  const [clicked, setClicked] = useState(0)
  const [updated, setUpdated] = useState(0)
  const [pending, setPending] = useState(false)
  const debouncedFn = useDebounceFn(
    () => setUpdated(value => value + 1),
    1000,
    { maxWait: 5000 },
  )

  function smash() {
    setClicked(value => value + 1)
    setPending(true)
    debouncedFn().finally(() => setPending(false))
  }

  return (
    <div>
      <button onClick={smash}>Smash me!</button>
      <button onClick={() => debouncedFn.cancel()}>Cancel</button>
      <button onClick={() => debouncedFn.flush()}>Flush</button>
      <p>Delay is set to 1000ms and maxWait is set to 5000ms for this demo.</p>
      <p>
        Pending:
        {' '}
        {pending ? 'yes' : 'no'}
      </p>
      <p>
        Button clicked:
        {' '}
        {clicked}
      </p>
      <p>
        Event handler called:
        {' '}
        {updated}
      </p>
    </div>
  )
}
