import { useBluetooth } from '@reaxuse/core'

export default function UseBluetoothDemo() {
  const {
    isConnected,
    isSupported,
    device,
    requestDevice,
    error,
  } = useBluetooth({
    acceptAllDevices: true,
  })

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-4">
      <div>{isSupported ? 'Bluetooth Web API Supported' : 'Your browser does not support the Bluetooth Web API'}</div>

      {isSupported
        ? (
            <div>
              <button type="button" onClick={() => void requestDevice()}>
                Request Bluetooth Device
              </button>
            </div>
          )
        : null}

      {device
        ? (
            <div>
              <p>
                Device Name:
                {' '}
                {device.name}
              </p>
            </div>
          )
        : null}

      {isConnected
        ? (
            <div className="bg-green-500 text-white p-3 rounded-md">
              <p>Connected</p>
            </div>
          )
        : (
            <div className="bg-orange-800 text-white p-3 rounded-md">
              <p>Not Connected</p>
            </div>
          )}

      {error
        ? (
            <div>
              <div>Errors:</div>
              <pre>
                <code className="block p-5 whitespace-pre">{String(error)}</code>
              </pre>
            </div>
          )
        : null}
    </div>
  )
}
