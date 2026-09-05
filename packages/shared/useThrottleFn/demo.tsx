import { useThrottleFn } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseThrottleFnDemo() {
  const [clicked, setClicked] = useState(0)
  const [updated, setUpdated] = useState(0)
  const throttledFn = useThrottleFn(() => setUpdated(value => value + 1), 1000)

  function smash() {
    setClicked(value => value + 1)
    throttledFn()
  }

  return (
    <div>
      <button onClick={smash}>Smash me!</button>
      <p>Delay is set to 1000ms for this demo.</p>
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
