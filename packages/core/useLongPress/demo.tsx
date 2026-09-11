import { useLongPress } from '@reause/core'
import { useRef, useState } from 'react'

export default function UseLongPressDemo() {
  const target = useRef<HTMLButtonElement | null>(null)
  const targetOptions = useRef<HTMLButtonElement | null>(null)
  const targetCallbacks = useRef<HTMLButtonElement | null>(null)

  const [longPressed, setLongPressed] = useState(false)
  const [released, setReleased] = useState('')

  function onLongPress() {
    setLongPressed(true)
  }

  function reset() {
    setLongPressed(false)
    setReleased('')
  }

  useLongPress(target, onLongPress)
  useLongPress(targetOptions, onLongPress, { delay: 1000 })
  useLongPress(targetCallbacks, onLongPress, {
    distanceThreshold: 24,
    delay: 1000,
    onMouseUp(duration, distance, isLongPress) {
      setReleased(`Held ${Math.round(duration)}ms, moved ${Math.round(distance)}px, long press: ${isLongPress}`)
    },
  })

  return (
    <div>
      <p>
        Long Pressed:
        {' '}
        <strong>{longPressed ? 'true' : 'false'}</strong>
      </p>
      <p>
        Released:
        {' '}
        <strong>{released || '—'}</strong>
      </p>
      <button ref={target} className="ml-2 button small">
        Press long (500ms)
      </button>
      <button ref={targetOptions} className="ml-2 button small">
        Press long (1000ms)
      </button>
      <button ref={targetCallbacks} className="ml-2 button small">
        Press long (1000ms) with onMouseUp
      </button>
      <button className="ml-2 button small" onClick={reset}>
        Reset
      </button>
    </div>
  )
}
