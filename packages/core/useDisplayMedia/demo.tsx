import { useDisplayMedia } from '@reaxuse/core'
import { useEffect, useRef } from 'react'

export default function UseDisplayMediaDemo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { stream, enabled, start, stop } = useDisplayMedia()

  useEffect(() => {
    if (videoRef.current)
      videoRef.current.srcObject = stream ?? null
  }, [stream])

  return (
    <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <button
          type="button"
          onClick={() => {
            if (enabled)
              stop()
            else
              start()
          }}
        >
          {enabled ? 'Stop' : 'Start'}
          {' '}
          sharing my screen
        </button>
      </div>
      <div>
        <video
          ref={videoRef}
          muted
          autoPlay
          controls
          style={{ width: 'auto', height: '400px' }}
        />
      </div>
    </div>
  )
}
