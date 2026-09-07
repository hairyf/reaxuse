import { useMediaControls } from '@reaxuse/core'
import { useEffect, useRef, useState } from 'react'

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0)
    return '00:00'
  return new Date(seconds * 1000).toISOString().slice(14, 19)
}

export default function UseMediaControlsDemo() {
  const video = useRef<HTMLVideoElement>(null)
  const [loop, setLoop] = useState(false)

  const {
    playing,
    buffered,
    currentTime,
    duration,
    tracks,
    waiting,
    selectedTrack,
    volume,
    rate,
    muted,
    isPictureInPicture,
    supportsPictureInPicture,
    togglePictureInPicture,
    enableTrack,
    disableTrack,
    toggle,
    toggleMute,
    setVolume,
    seek,
    setRate,
  } = useMediaControls(video, {
    src: {
      src: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Sintel_movie_4K.webm',
      type: 'video/webm',
    },
    tracks: [
      {
        default: true,
        src: 'https://gist.githubusercontent.com/wheatjs/a85a65a82d87d7c098e1a0972ef1f726/raw',
        kind: 'subtitles',
        label: 'English',
        srcLang: 'en',
      },
      {
        src: 'https://gist.githubusercontent.com/wheatjs/38f32925d20c683bf77ba33ff737891b/raw',
        kind: 'subtitles',
        label: 'French',
        srcLang: 'fr',
      },
    ],
  })

  const endBuffer = buffered.length > 0 ? buffered[buffered.length - 1]![1] : 0
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferProgress = duration > 0 ? Math.max(Math.min(endBuffer / duration, 1) * 100, progress) : 0

  // Upstream demo keyboard shortcuts: space toggles playback, arrows seek ±10s
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        toggle()
      }
      else if (event.key === 'ArrowRight') {
        seek(currentTime + 10)
      }
      else if (event.key === 'ArrowLeft') {
        seek(currentTime - 10)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentTime, seek, toggle])

  return (
    <div className="text-sm text-gray-200" tabIndex={0}>
      <div className="relative mt-5 overflow-hidden rounded-md bg-black shadow">
        <video
          ref={video}
          crossOrigin="anonymous"
          className="block w-full"
          poster="https://cdn.bitmovin.com/content/assets/sintel/poster.png"
          loop={loop}
          onClick={() => toggle()}
        />
        {waiting && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}

        {/* Scrubber with the buffered range as the secondary track */}
        <input
          type="range"
          className="absolute inset-x-0 bottom-0 w-full"
          min={0}
          max={duration || 0}
          step={0.01}
          value={Math.min(currentTime, duration || 0)}
          style={{
            background: `linear-gradient(to right, #60a5fa ${progress}%, #374151 ${progress}%, #374151 ${bufferProgress}%, #1f2937 ${bufferProgress}%)`,
          }}
          onChange={e => seek(Number(e.target.value))}
        />
      </div>

      <div className="mt-2 flex flex-row items-center gap-2">
        <button
          type="button"
          className="rounded bg-gray-800 px-3 py-1"
          onClick={() => toggle()}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="rounded bg-gray-800 px-3 py-1"
          onClick={() => toggleMute()}
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>
        <input
          type="range"
          className="w-32"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={e => setVolume(Number(e.target.value))}
        />
        <div className="ml-2 flex-1 text-xs">
          {formatDuration(currentTime)}
          {' '}
          /
          {' '}
          {formatDuration(duration)}
        </div>
        <button
          type="button"
          className="rounded bg-gray-800 px-3 py-1"
          onClick={() => disableTrack()}
        >
          Captions: Off
        </button>
        {tracks.map(track => (
          <button
            type="button"
            key={track.id}
            className={`rounded px-3 py-1 ${selectedTrack === track.id && track.mode === 'showing' ? 'bg-blue-600' : 'bg-gray-800'}`}
            onClick={() => enableTrack(track)}
          >
            {track.label}
          </button>
        ))}
        <button
          type="button"
          className="rounded bg-gray-800 px-3 py-1"
          onClick={() => setRate(rate === 1 ? 2 : 1)}
        >
          Speed
        </button>
        {supportsPictureInPicture && (
          <button
            type="button"
            className="rounded bg-gray-800 px-3 py-1"
            onClick={() => togglePictureInPicture()}
          >
            {isPictureInPicture ? 'Exit PiP' : 'Enter PiP'}
          </button>
        )}
      </div>

      <label className="mt-2 inline-flex items-center gap-1 text-xs">
        <input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)} />
        Loop
      </label>
    </div>
  )
}
