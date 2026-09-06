import { useSupported } from '@reaxuse/core'

export default function UseSupportedDemo() {
  const isBatterySupported = useSupported(() => navigator && 'getBattery' in navigator)

  return (
    <div>
      <p>
        {'Battery Status API is '}
        <strong>{isBatterySupported ? 'supported' : 'not supported'}</strong>
      </p>
    </div>
  )
}
