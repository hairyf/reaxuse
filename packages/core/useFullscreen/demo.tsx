import { useFullscreen } from '@reaxuse/core'
import { useRef } from 'react'

export default function UseFullscreenDemo() {
  const el = useRef<HTMLVideoElement>(null)
  const { isFullscreen, toggle } = useFullscreen(el)

  return (
    <div className="text-center">
      <video
        ref={el}
        className="m-auto rounded"
        src="https://vjs.zencdn.net/v/oceans.mp4"
        width="600"
        controls
      />
      <div className="py-4">
        <button type="button" onClick={() => toggle()}>
          {isFullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}
        </button>
      </div>
    </div>
  )
}
