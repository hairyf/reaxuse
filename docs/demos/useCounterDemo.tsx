import { useCounter } from '@reaxuse/core'

export default function UseCounterDemo() {
  const { count, inc, dec, reset } = useCounter(0, { min: 0, max: 10 })

  return (
    <div>
      <p>
        count: <strong>{count}</strong>
      </p>
      <button onClick={() => inc()}>+</button>
      <button onClick={() => dec()}>−</button>
      <button onClick={reset}>reset</button>
    </div>
  )
}
