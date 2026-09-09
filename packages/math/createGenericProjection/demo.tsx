import { useState } from 'react'
import { createGenericProjection } from '../createGenericProjection'

const from = [0, 10] as const
const to = ['cold', 'hot'] as const

export default function CreateGenericProjectionDemo() {
  const [input, setInput] = useState(0)
  const projector = createGenericProjection<number, string>(
    from,
    to,
    (value, fromDomain, toDomain) => (value > (fromDomain[0] + fromDomain[1]) / 2 ? toDomain[1] : toDomain[0]),
  )

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
