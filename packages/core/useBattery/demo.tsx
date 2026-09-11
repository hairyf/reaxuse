import { useBattery } from '@reause/core'

export default function UseBatteryDemo() {
  const battery = useBattery()

  return (
    <div>
      {battery.isSupported
        ? (
            <div>
              <p>
                Is Charging:
                {battery.charging ? 'Yes' : 'No'}
              </p>
              <p>
                Battery Level:
                {(battery.level * 100).toFixed(0)}
                %
              </p>
            </div>
          )
        : (
            <div>Battery API not supported</div>
          )}
      <pre lang="yaml">{JSON.stringify(battery, null, 2)}</pre>
    </div>
  )
}
