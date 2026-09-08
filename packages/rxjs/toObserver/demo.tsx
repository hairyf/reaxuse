import { useEffect, useState } from 'react'
// Relative (not `@reaxuse/rxjs`): until this PR is merged the package name
// resolves through the worktree node_modules junction to the main repo's
// still-empty rxjs package.
import { interval } from 'rxjs'
import { take } from 'rxjs/operators'
import { toObserver } from '../src/toObserver'

export default function ToObserverDemo() {
  // the clearest illustration of the React adjustment: a `useState` setter is
  // a valid target, so every emission re-renders (a `useRef` target would be
  // accepted too, but its writes never re-render)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const subscription = interval(1000)
      .pipe(take(5))
      .subscribe(toObserver(setCount))

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div>
      <p>
        count is:
        {count}
      </p>
      <button onClick={() => setCount(0)}>reset</button>
    </div>
  )
}
