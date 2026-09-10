// Relative (not `@reaxuse/rxjs`): until this PR is merged the package name
// resolves through the worktree node_modules junction to the main repo's
// rxjs package, which does not export `useSubject` yet.
import { BehaviorSubject } from 'rxjs'
import { useSubject } from '../useSubject'

// upstream demo: the subject lives outside React, so every subscriber — the
// component included — sees the same value
const nameSubject = new BehaviorSubject('initial')

export default function UseSubjectDemo() {
  const [value, setValue] = useSubject(nameSubject)

  return (
    <div>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <p>
        value is:
        {value}
      </p>
      <button onClick={() => nameSubject.next('from subject')}>
        emit from the subject
      </button>
    </div>
  )
}
