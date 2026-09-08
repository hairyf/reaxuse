import { useLongPress } from '@reaxuse/core'
import { useRef, useState } from 'react'

export default function UseLongPressDemo() {
  const target = useRef<HTMLButtonElement | null>(null)
  const targetOptions = useRef<HTMLButtonElement | null>(null)
  const targetCallbacks = useRef<HTMLButtonElement | null>(null)

  const [longPressed, setLongPressed] = useState(false)
  const [clicked, setClicked] = useState(false)

  function onLongPress() {
    setLongPressed(true)
  }

  function onCancel() {
    setClicked(true)
  }

  function reset() {
    setLongPressed(false)
    setClicked(false)
  }

  useLongPress(target, onLongPress)
  useLongPress(targetOptions, onLongPress, { threshold: 1000 })
  useLongPress(targetCallbacks, onLongPress, {
    distanceThreshold: 24,
    threshold: 1000,
    onCancel,
  })

  return (
    <div>
      <p>
        Long Pressed:
        {' '}
        <strong>{longPressed ? 'true' : 'false'}</strong>
      </p>
      <p>
        Clicked:
        {' '}
        <strong>{clicked ? 'true' : 'false'}</strong>
      </p>
      <button ref={target} className="ml-2 button small">
        Press long (500ms)
      </button>
      <button ref={targetOptions} className="ml-2 button small">
        Press long (1000ms)
      </button>
      <button ref={targetCallbacks} className="ml-2 button small">
        Press long (1000ms) or click
      </button>
      <button className="ml-2 button small" onClick={reset}>
        Reset
      </button>
    </div>
  )
}
