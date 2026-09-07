import { useDeviceMotion } from '@reaxuse/core'

export default function UseDeviceMotionDemo() {
  const {
    acceleration,
    accelerationIncludingGravity,
    rotationRate,
    interval,
    isSupported,
    requirePermissions,
    ensurePermissions,
    permissionGranted,
  } = useDeviceMotion()

  return (
    <div>
      <p>
        Device Motion:
      </p>
      {!isSupported
        ? <div>Not supported by your current browser.</div>
        : (
            <div>
              {requirePermissions && !permissionGranted
                ? (
                    <div>
                      <p>Permission is required</p>
                      <button onClick={() => void ensurePermissions()}>
                        Request Permission
                      </button>
                    </div>
                  )
                : (
                    <pre lang="json">{JSON.stringify({ acceleration, accelerationIncludingGravity, rotationRate, interval }, null, 2)}</pre>
                  )}
            </div>
          )}
    </div>
  )
}
