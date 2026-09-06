import { useSpeechSynthesis } from '@reaxuse/core'
import { useEffect, useState } from 'react'

export default function UseSpeechSynthesisDemo() {
  const [text, setText] = useState('Hello, everyone! Good morning!')
  const [pitch, setPitch] = useState(1)
  const [rate, setRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [voice, setVoice] = useState<SpeechSynthesisVoice | undefined>(undefined)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [boundaryStart, setBoundaryStart] = useState(0)
  const [boundaryEnd, setBoundaryEnd] = useState(0)

  function onBoundary(event: SpeechSynthesisEvent) {
    const { charIndex, charLength } = event
    const startIndex = charIndex
    let endIndex = charIndex
    if (typeof charLength === 'number' && charLength > 0)
      endIndex = startIndex + charLength
    else
      endIndex = startIndex + (text.slice(startIndex).match(/^\S+/)?.[0]?.length ?? 0)
    setBoundaryStart(startIndex)
    setBoundaryEnd(endIndex)
  }

  const speech = useSpeechSynthesis(text, {
    voice,
    pitch,
    rate,
    volume,
    onBoundary,
  })

  function resetSpeakingText() {
    setBoundaryStart(0)
    setBoundaryEnd(0)
  }

  function play() {
    if (speech.status === 'pause') {
      window.speechSynthesis.resume()
    }
    else {
      resetSpeakingText()
      speech.speak()
    }
  }

  function pause() {
    window.speechSynthesis.pause()
  }

  function stop() {
    speech.stop()
    resetSpeakingText()
  }

  // upstream loads the voices "at last" — after mount, once the synth is ready
  useEffect(() => {
    if (!speech.isSupported)
      return
    const id = setTimeout(() => {
      const list = window.speechSynthesis.getVoices()
      setVoices(list)
      setVoice(list[0])
    })
    return () => clearTimeout(id)
  }, [speech.isSupported])

  useEffect(() => {
    if (speech.status === 'end') {
      setBoundaryStart(0)
      setBoundaryEnd(0)
    }
  }, [speech.status])

  if (!speech.isSupported) {
    return (
      <div>
        Your browser does not support SpeechSynthesis API,
        {' '}
        <a href="https://caniuse.com/mdn-api_speechsynthesis" target="_blank" rel="noreferrer">more details</a>
      </div>
    )
  }

  const fullText = text || ''
  const startIndex = Math.max(0, Math.min(boundaryStart, fullText.length))
  const endIndex = Math.max(startIndex, Math.min(boundaryEnd, fullText.length))

  return (
    <div>
      <div>
        <label htmlFor="use-speech-synthesis-text">Spoken Text</label>
        <input
          id="use-speech-synthesis-text"
          type="text"
          value={text}
          onChange={event => setText(event.target.value)}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <label>Speaking Text</label>
        {' '}
        <span>{fullText.slice(0, startIndex)}</span>
        <span style={{ color: 'var(--vp-c-brand)' }}>{fullText.slice(startIndex, endIndex)}</span>
        <span>{fullText.slice(endIndex)}</span>
      </div>

      <div style={{ marginTop: 8 }}>
        <label htmlFor="use-speech-synthesis-voice">Language</label>
        {' '}
        <select
          id="use-speech-synthesis-voice"
          value={voice ? `${voice.name} (${voice.lang})` : ''}
          onChange={(event) => {
            const selected = voices.find(v => `${v.name} (${v.lang})` === event.target.value)
            setVoice(selected)
          }}
        >
          <option disabled value="">Select Language</option>
          {voices.map(v => (
            <option key={`${v.name}-${v.lang}`} value={`${v.name} (${v.lang})`}>
              {`${v.name} (${v.lang})`}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 8 }}>
        <label htmlFor="use-speech-synthesis-pitch">Pitch</label>
        {' '}
        <input
          id="use-speech-synthesis-pitch"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={pitch}
          onChange={event => setPitch(Number(event.target.value))}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <label htmlFor="use-speech-synthesis-rate">Rate</label>
        {' '}
        <input
          id="use-speech-synthesis-rate"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={event => setRate(Number(event.target.value))}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <label htmlFor="use-speech-synthesis-volume">Volume</label>
        {' '}
        <input
          id="use-speech-synthesis-volume"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={volume}
          onChange={event => setVolume(Number(event.target.value))}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <button disabled={speech.isPlaying} onClick={play}>
          {speech.status === 'pause' ? 'Resume' : 'Speak'}
        </button>
        {' '}
        <button disabled={!speech.isPlaying} onClick={pause}>
          Pause
        </button>
        {' '}
        <button disabled={!speech.isPlaying} onClick={stop}>
          Stop
        </button>
      </div>
    </div>
  )
}
