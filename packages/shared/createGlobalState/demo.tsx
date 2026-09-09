import { createGlobalState } from '@reaxuse/shared'
import { useState } from 'react'

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
