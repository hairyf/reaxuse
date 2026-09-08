// Relative (not `@reaxuse/math`): until this PR is merged the package name
// resolves through the worktree node_modules junction to the main repo's math
// package, which does not yet export createProjection.
import { useState } from 'react'
import { createProjection } from '../src/createProjection'

const from = [0, 10] as const
const to = [10, 100] as const

export default function CreateProjectionDemo() {
  const [input, setInput] = useState(0)
  // rebuilt on every render — the projector resolves its domains on each call
  const useProjector = createProjection(from, to)

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
