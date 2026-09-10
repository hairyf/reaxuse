// Relative (not `@reaxuse/rxjs`): until this PR is merged the package name
// resolves through the worktree node_modules junction to the main repo's
// rxjs package, which does not export `useFrom` yet.
import { useState } from 'react'
import { useFrom } from '../useFrom'
import { useObservable } from '../useObservable'

export default function UseFromDemo() {
  const [count, setCount] = useState(0)

  // `count$` emits 0 immediately, then re-emits whenever `count` changes —
  // the stable observable is fed into `useObservable` to render the value.
  const count$ = useFrom(count)
  const [display] = useObservable(count$, { initialValue: 0 })

  return (
    <div>
      <p>
        count$ is:
        {display}
      </p>
      <button onClick={() => setCount(value => value + 1)}>increment</button>
      <button onClick={() => setCount(0)}>reset</button>
    </div>
  )
}
