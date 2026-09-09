import { useState } from 'react'
import { createProjection } from '../createProjection'

const from = [0, 10] as const
const to = [10, 100] as const

export default function CreateProjectionDemo() {
  const [input, setInput] = useState(0)
  const projector = createProjection(from, to)

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
        {projector(input)}
      </div>
    </div>
  )
}
