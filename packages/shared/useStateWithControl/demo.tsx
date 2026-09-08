import { useStateWithControl } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseStateWithControlDemo() {
  const [lastChanged, setLastChanged] = useState<string | null>(null)
  const [lastDismissed, setLastDismissed] = useState<string | null>(null)
  const [num, setNum, control] = useStateWithControl(0, {
    // disallow changes larger then ±5 in one operation
    onBeforeChange(value, oldValue) {
      if (Math.abs(value - oldValue) > 5) {
        setLastDismissed(`${oldValue} -> ${value}`)
        return false
      }
      setLastDismissed(null)
      return true
    },
    onChanged(value, oldValue) {
      setLastChanged(`${oldValue} -> ${value}`)
    },
  })
  const [controlValue, setControlValue] = useState(42)
  // bump to re-render, so `control.peek()` shows values that were written
  // without triggering (silentSet / lay)
  const [, refresh] = useState(0)

  return (
    <div>
      <p>
        Value:
        {' '}
        <strong>{num}</strong>
        {' '}
        (peek:
        {' '}
        {control.peek()}
        )
      </p>
      <p>
        Jump by
        {' '}
        {[-5, -1, 1, 5, 10].map(delta => (
          <button key={delta} onClick={() => setNum(current => current + delta)}>
            {delta >= 0 ? `+${delta}` : delta}
          </button>
        ))}
      </p>
      <p>
        Last change:
        {' '}
        {lastChanged ?? '-'}
      </p>
      <p>
        Dismissed (jump over ±5):
        {' '}
        {lastDismissed ?? '-'}
      </p>
      <h3>Fine-grained control object</h3>
      <p>
        <input
          type="number"
          value={controlValue}
          onChange={event => setControlValue(Number.parseInt(event.target.value) || 0)}
        />
        {' '}
        <button onClick={() => control.set(controlValue)}>control.set(v)</button>
        {' '}
        <button onClick={() => control.silentSet(controlValue)}>control.silentSet(v)</button>
        {' '}
        <button onClick={() => control.reset()}>control.reset()</button>
        {' '}
        <button onClick={() => refresh(current => current + 1)}>re-render</button>
      </p>
      <p>
        `control.set(v)` re-renders the component; `control.silentSet(v)` updates the value
        without a re-render — use `re-render` to see it.
      </p>
    </div>
  )
}
