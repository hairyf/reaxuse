// Relative (not `@reaxuse/rxjs`): until this PR is merged the package name
// resolves through the worktree node_modules junction to the main repo's
// rxjs package, which does not export `useObservable` yet.
import { interval } from 'rxjs'
import { mapTo, scan, startWith } from 'rxjs/operators'
import { useObservable } from '../useObservable'

export default function UseObservableDemo() {
  // upstream demo: 0, 1, 3, 6, ... accumulated every second
  const [total, setTotal] = useObservable(
    interval(1000).pipe(
      mapTo(1),
      startWith(0),
      scan((sum, next) => sum + next, 0),
    ),
    { initialValue: 0 },
  )

  // the state is also writable from React code — the next emission overwrites it
  const [count, setCount] = useObservable(interval(1000), { initialValue: 0 })

  return (
    <div>
      <p>
        total is:
        {total}
      </p>
      <p>
        count is:
        {count}
      </p>
      <p>Update every 1s</p>
      <button onClick={() => setTotal(0)}>reset total</button>
      <button onClick={() => setCount(value => value + 100)}>+100</button>
    </div>
  )
}
