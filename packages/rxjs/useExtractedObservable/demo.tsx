// Relative (not `@reause/rxjs`): until this PR is merged the package name
// resolves through the worktree node_modules junction to the main repo's
// rxjs package, which does not export `useExtractedObservable` yet.
import { useState } from 'react'
import { interval } from 'rxjs'
import { mapTo, scan, startWith, takeWhile } from 'rxjs/operators'
import { useExtractedObservable } from '../useExtractedObservable'

export default function UseExtractedObservableDemo() {
  // upstream demo (`_demo.vue`): the counter restarts from the `start` input
  const [start, setStart] = useState(0)
  const count = useExtractedObservable(start, seed => interval(1000).pipe(
    mapTo(1),
    startWith(seed),
    scan((total, next) => total + next, 0),
  ))

  // `takeWhile` completes the observable, so the value stops growing and
  // `onComplete` is reported — a new `start` re-extracts and starts over
  const [done, setDone] = useState(false)
  const capped = useExtractedObservable(start, seed => interval(1000).pipe(
    mapTo(1),
    startWith(seed),
    scan((total, next) => total + next, 0),
    takeWhile(n => n < 5),
  ), {
    onComplete: () => setDone(true),
  })

  return (
    <div>
      <label>
        Start:
        <input
          type="number"
          value={start}
          onChange={(e) => {
            setStart(Number(e.target.value))
            setDone(false)
          }}
        />
      </label>
      <p>
        Counter:
        {count}
      </p>
      <p>
        Capped:
        {capped}
        {done ? ' (completed)' : ''}
      </p>
    </div>
  )
}
