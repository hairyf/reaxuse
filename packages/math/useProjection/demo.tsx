import { useProjection } from '@reaxuse/math'
import { useState } from 'react'

const from = [0, 10] as const
const to = [10, 100] as const

export default function UseProjectionDemo() {
  const [input, setInput] = useState(0)
  const output = useProjection(input, from, to)

  return (
    <div>
      <div>
        {`Projection from [${from[0]}, ${from[1]}] to [${to[0]}, ${to[1]}]`}
      </div>
      <div>
        <input
          id="input"
          type="range"
          min={from[0]}
          max={from[1]}
          value={input}
          onChange={event => setInput(Number(event.target.value))}
        />
      </div>
      <div>
        Input:
        {' '}
        {input}
      </div>
      <div>
        Output:
        {' '}
        {output}
      </div>
    </div>
  )
}
