import { useVibrate } from '@reaxuse/core'

export default function UseVibrateDemo() {
  const { isSupported, vibrate, stop } = useVibrate({ pattern: [300, 100, 300] })

  return (
    <div>
      <p>{isSupported ? 'Vibration API Supported' : 'Your browser does not support the Vibration API'}</p>
      {isSupported && (
        <div>
          <button type="button" onClick={() => vibrate()}>
            Vibrate
          </button>
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        </div>
      )}
    </div>
  )
}
