// Relative (not `@reaxuse/math`): until this PR is merged the package name
// resolves through the worktree node_modules junction to the main repo's math
// package, which does not yet export createGenericProjection.
import { useState } from 'react'
import { createGenericProjection } from '../src/createGenericProjection'

const from = [0, 10] as const
const to = ['cold', 'hot'] as const

export default function CreateGenericProjectionDemo() {
  const [input, setInput] = useState(0)
  // rebuilt on every render — the projector resolves its domains on each call
  const useProjector = createGenericProjection<number, string>(
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
        {useProjector(input)}
      </div>
    </div>
  )
}
