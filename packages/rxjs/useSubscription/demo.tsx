// Relative (not `@reause/rxjs`): until this PR is merged the package name
// resolves through the worktree node_modules junction to the main repo's
// rxjs package, which does not export `useSubscription` yet.
import { useState } from 'react'
import { interval } from 'rxjs'
import { useSubscription } from '../useSubscription'

export default function UseSubscriptionDemo() {
  const [count, setCount] = useState(0)

  // upstream demo: the counter increments every second and the subscription is
  // unsubscribed when the component unmounts
  useSubscription(
    interval(1000)
      .subscribe(() => {
        setCount(c => c + 1)
      }),
  )

  return (
    <div>
      <p>Update every 1s</p>
      <p>
        Counter:
        {count}
      </p>
    </div>
  )
}
