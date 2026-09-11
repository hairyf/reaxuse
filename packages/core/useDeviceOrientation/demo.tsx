import { useDeviceOrientation } from '@reause/core'

export default function UseDeviceOrientationDemo() {
  const { isAbsolute, alpha, beta, gamma } = useDeviceOrientation()

  return (
    <div>
      <p>
        Device Orientation:
      </p>
      <pre lang="json">{JSON.stringify({ isAbsolute, alpha, beta, gamma }, null, 2)}</pre>
    </div>
  )
}
