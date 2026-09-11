import { useGamepad } from '@reause/core'
import { useEffect, useState } from 'react'

export default function UseGamepadDemo() {
  const [gamepads, , { isSupported }] = useGamepad()

  // `isSupported` resolves in a mount effect, so gate the "unsupported"
  // branch on it — otherwise the first render would flash the unsupported
  // message even on devices that do support the Gamepad API.
  const [resolved, setResolved] = useState(false)
  useEffect(() => {
    setResolved(true)
  }, [])

  if (resolved && !isSupported) {
    return (
      <div>
        <p>
          <strong>Gamepad is not supported on this device.</strong>
        </p>
        <p>
          It seems your device does not support the Gamepad API. Check
          {' '}
          <a href="https://caniuse.com/gamepad">here</a>
          {' '}
          for a list supported devices.
        </p>
      </div>
    )
  }

  if (gamepads.length === 0) {
    return (
      <div>
        <p>
          <strong>No Gamepad Detected</strong>
        </p>
        <p>Ensure your gamepad is connected and press a button to wake it up.</p>
      </div>
    )
  }

  return (
    <div>
      {gamepads.map(gamepad => (
        <div key={gamepad.id}>
          <strong>{gamepad.id}</strong>
          <div>
            Axes:
            {' '}
            {Array.from(gamepad.axes).join(', ')}
          </div>
          <div>
            Buttons:
            {' '}
            {Array.from(gamepad.buttons).map((button, index) => (
              <span key={index}>{button.pressed ? 'X' : 'O'}</span>
            )).join(' ')}
          </div>
        </div>
      ))}
    </div>
  )
}
