import { useUserMedia } from '@reaxuse/core'
import { useEffect, useRef } from 'react'

export default function UseUserMediaDemo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { stream, enabled, start, stop } = useUserMedia()

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
