import { useRafFn } from '@reaxuse/core'
import { useState } from 'react'

export default function UseRafFnDemo() {
  const fpsLimit = 60
  const [count, setCount] = useState(0)
  const [deltaMs, setDeltaMs] = useState(0)

  const { pause, resume } = useRafFn(({ delta }) => {
    setDeltaMs(delta)
    setCount(c => c + 1)
  }, { fpsLimit })

  return (
    <div>
      <p>
        Frames:
        {' '}
        <strong>{count}</strong>
      </p>
      <p>
        Delta:
        {' '}
        {deltaMs.toFixed(0)}
        ms
      </p>
      <p>
        FPS Limit:
        {' '}
        {fpsLimit}
      </p>
      <button onClick={pause}>
        pause
      </button>
      <button onClick={resume}>
        resume
      </button>
    </div>
  )
}
