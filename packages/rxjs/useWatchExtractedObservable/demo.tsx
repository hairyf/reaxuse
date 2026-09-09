// Relative (not `@reaxuse/rxjs`): until this PR is merged the package name
// resolves through the worktree node_modules junction to the main repo's
// still-empty rxjs package.
import type { Observable } from 'rxjs'
import { useState } from 'react'
import { Subject } from 'rxjs'
import { useWatchExtractedObservable } from '../useWatchExtractedObservable'

interface Player {
  progress$: Observable<number>
}

function PlayerDemo({ onReset }: { onReset: () => void }) {
  const [subject] = useState(() => new Subject<number>())
  // stable identity — a new `player` object would re-extract on every render
  const [player] = useState<Player>(() => ({ progress$: subject }))
  const [attached, setAttached] = useState(true)
  const [progress, setProgress] = useState<number | null>(null)
  const [status, setStatus] = useState('waiting for a snapshot')
  const [stopped, setStopped] = useState(false)

  // `attached ? player : null` mirrors upstream's nullish source: a nullish
  // value subscribes to nothing and drops the previous subscription.
  const { stop } = useWatchExtractedObservable(
    attached ? player : null,
    (value, onCleanup) => {
      onCleanup(() => setStatus('previous run cleaned up'))
      return value.progress$
    },
    (snapshot) => {
      setProgress(snapshot)
      setStatus(`snapshot ${snapshot}`)
    },
    {
      onComplete: () => setStatus('observable completed'),
      onError: err => setStatus(`error: ${String(err)}`),
    },
  )

  return (
    <div>
      <p>
        progress:
        {progress ?? '—'}
      </p>
      <p>{status}</p>
      <button
        onClick={() => subject.next(Math.round(Math.random() * 100))}
        disabled={!attached || stopped}
      >
        Emit progress
      </button>
      <button onClick={() => setAttached(value => !value)}>
        {attached ? 'Detach source' : 'Attach source'}
      </button>
      <button
        onClick={() => {
          stop()
          setStopped(true)
          setStatus('stopped — later source changes no longer subscribe')
        }}
      >
        Stop
      </button>
      <button onClick={onReset} disabled={!stopped}>
        Reset
      </button>
    </div>
  )
}

export default function UseWatchExtractedObservableDemo() {
  // `stop` is permanent (upstream `WatchHandle` parity), so the demo remounts
  // the hook to start watching again.
  const [key, setKey] = useState(0)
  return <PlayerDemo key={key} onReset={() => setKey(value => value + 1)} />
}
