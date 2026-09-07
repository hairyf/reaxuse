import { useGamepad } from '@reaxuse/core'

export default function UseGamepadDemo() {
  const { isSupported, gamepads } = useGamepad()

  if (!isSupported) {
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
