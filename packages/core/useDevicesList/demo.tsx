import { useDevicesList } from '@reause/core'

export default function UseDevicesListDemo() {
  const {
    videoInputs: cameras,
    audioInputs: microphones,
    audioOutputs: speakers,
  } = useDevicesList({
    requestPermissions: true,
  })

  return (
    <div className="grid grid-cols-3 gap-4 text-center p-4">
      <div>
        <div className="opacity-50 uppercase tracking-wide text-sm mb-2">
          Cameras
          {`(${cameras.length})`}
        </div>
        <ul>
          {cameras.map(camera => <li key={camera.deviceId} className="text-sm">{camera.label}</li>)}
        </ul>
      </div>
      <div>
        <div className="opacity-50 uppercase tracking-wide text-sm mb-2">
          Microphones
          {`(${microphones.length})`}
        </div>
        <ul>
          {microphones.map(microphone => <li key={microphone.deviceId} className="text-sm">{microphone.label}</li>)}
        </ul>
      </div>
      <div>
        <div className="opacity-50 uppercase tracking-wide text-sm mb-2">
          Speakers
          {`(${speakers.length})`}
        </div>
        <ul>
          {speakers.map(speaker => <li key={speaker.deviceId} className="text-sm">{speaker.label}</li>)}
        </ul>
      </div>
    </div>
  )
}
