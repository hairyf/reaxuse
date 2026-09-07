import { useGeolocation } from '@reaxuse/core'

export default function UseGeolocationDemo() {
  const { coords, locatedAt, error, resume, pause } = useGeolocation()

  return (
    <div>
      <pre lang="json">
        {JSON.stringify(
          {
            coords: {
              accuracy: coords.accuracy,
              latitude: coords.latitude,
              longitude: coords.longitude,
              altitude: coords.altitude,
              altitudeAccuracy: coords.altitudeAccuracy,
              heading: coords.heading,
              speed: coords.speed,
            },
            locatedAt,
            error: error ? error.message : error,
          },
          null,
          2,
        )}
      </pre>
      <button onClick={pause}>
        Pause watch
      </button>
      <button onClick={resume}>
        Start watch
      </button>
    </div>
  )
}
