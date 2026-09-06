import { usePermission } from '@reaxuse/core'

const PERMISSION_NAMES = [
  'accelerometer',
  'accessibility-events',
  'ambient-light-sensor',
  'background-sync',
  'camera',
  'clipboard-read',
  'clipboard-write',
  'geolocation',
  'gyroscope',
  'magnetometer',
  'microphone',
  'notifications',
  'payment-handler',
  'persistent-storage',
  'push',
  'speaker',
  'local-fonts',
] as const

function PermissionLine({ name }: { name: (typeof PERMISSION_NAMES)[number] }) {
  const state = usePermission(name)

  return (
    <div>
      {name}
      {': '}
      <strong>{state}</strong>
    </div>
  )
}

export default function UsePermissionDemo() {
  return (
    <pre>
      {PERMISSION_NAMES.map(name => <PermissionLine key={name} name={name} />)}
    </pre>
  )
}
