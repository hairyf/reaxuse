import { createSharedHook } from '@reaxuse/shared'
import { useState } from 'react'

// a shared composable: the first consumer to render (the "creator") runs the
// wrapped hook on every render and publishes the value; every other consumer
// reads the same snapshot — CompA and CompB share one instance, and no new
// listeners are registered for the second consumer
const useSharedCounter = createSharedHook((initial: number) => {
  const [count, setCount] = useState(initial)

  return { count, setCount }
})

function Counter({ label }: { label: string }) {
  const { count, setCount } = useSharedCounter(0)

  return (
    <div>
      <span>{`${label}: ${count}`}</span>
      {' '}
      <button onClick={() => setCount(current => current + 1)}>
        increment
        {' '}
        {label}
      </button>
    </div>
  )
}

export default function CreateSharedHookDemo() {
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
