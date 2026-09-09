// Relative (not `@reaxuse/shared`): until this PR is merged the package name
// resolves through the worktree node_modules junction to the main repo's
// still-empty shared isDefined module.
import { useState } from 'react'
import { isDefined } from '../isDefined'

export default function IsDefinedDemo() {
  const [value, setValue] = useState<string | undefined>('example')
  // ref-like wrapper mirrors the upstream docs' `ref(...)` example — rebuilt
  // on every render so the guard always sees the latest value
  const example = { current: value }

  return (
    <div>
      <p>
        isDefined(example):
        {' '}
        <strong>{String(isDefined(example))}</strong>
      </p>
      {isDefined(example) && (
        <p>
          current:
          {example.current}
        </p>
      )}
      <button onClick={() => setValue(current => (current === undefined ? 'example' : undefined))}>
        toggle undefined
      </button>
    </div>
  )
}
