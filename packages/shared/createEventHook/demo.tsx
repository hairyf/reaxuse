// Relative import (not `@reaxuse/shared`): until this PR is merged the package
// name resolves through the worktree node_modules junction to the main repo's
// copy of @reaxuse/shared, which does not contain createEventHook yet.
import { useEffect, useState } from 'react'
import { createEventHook } from '../src/createEventHook'

export default function CreateEventHookDemo() {
  const [count, setCount] = useState(0)
  // create the event hook once per component instance
  const [counter] = useState(() => createEventHook<number>())

  // register on mount, unregister via the returned `{ off }` on unmount
  useEffect(() => counter.on(value => setCount(value)).off, [counter])

  return (
    <div>
      <p>
        count:
        {' '}
        <strong>{count}</strong>
      </p>
      <button onClick={() => counter.trigger(count + 1)}>tick</button>
      <button onClick={() => counter.clear()}>clear listeners</button>
    </div>
  )
}
