// Relative import (not `@reaxuse/shared`): until this PR is merged the package
// name resolves through the worktree node_modules junction to the main repo's
// copy of @reaxuse/shared, which does not contain createGlobalState yet.
import { useState } from 'react'
import { createGlobalState } from '../src/createGlobalState'

// module-level store: every `Counter` below reads and writes the same state,
// and it survives unmounting any of them
const useGlobalCount = createGlobalState(() => ({ count: 0 }))

function Counter({ label }: { label: string }) {
  const [state, setState] = useGlobalCount()

  return (
    <div>
      <span>{`${label}: ${state.count}`}</span>
      {' '}
      <button onClick={() => setState(prev => ({ count: prev.count + 1 }))}>
        increment
        {' '}
        {label}
      </button>
    </div>
  )
}

export default function CreateGlobalStateDemo() {
  const [mounted, setMounted] = useState(true)

  return (
    <div>
      <Counter label="counter-a" />
      {mounted && <Counter label="counter-b" />}
      <button onClick={() => setMounted(current => !current)}>
        {mounted ? 'unmount counter-b' : 'remount counter-b'}
      </button>
    </div>
  )
}
