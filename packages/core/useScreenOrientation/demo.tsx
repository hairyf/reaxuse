import { useScreenOrientation } from '@reaxuse/core'

export default function UseScreenOrientationDemo() {
  const { isSupported, orientation, angle } = useScreenOrientation()

  return (
    <div>
      <p>
        For best results, please use a mobile or tablet device (or use your
        browser's native inspector to simulate an orientation change)
      </p>
      <div>
        {'isSupported: '}
        <strong>{isSupported ? 'true' : 'false'}</strong>
      </div>
      <div>
        {'Orientation Type: '}
        <strong>{orientation ?? 'unknown'}</strong>
      </div>
      <div>
        {'Orientation Angle: '}
        <strong>{angle}</strong>
      </div>
    </div>
  )
}
