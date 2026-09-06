import { useWatchPausable } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchPausableDemo() {
  const [log, setLog] = useState('')
  const [value, setValue] = useState('')
  const { pause, resume, isActive } = useWatchPausable(
    value,
    v => setLog(prev => `${prev}Changed to "${v}"\n`),
  )

  function clear() {
    setLog('')
  }

  return (
    <div>
      <p>
        Type something below to trigger the watch
      </p>
      <input
        type="text"
        value={value}
        placeholder="Try to type anything..."
        onChange={event => setValue(event.target.value)}
      />
      <button disabled={!isActive} onClick={pause}>Pause</button>
      <button disabled={isActive} onClick={resume}>Resume</button>
      <button onClick={clear}>Clear Log</button>
      <p>
        Log
      </p>
      <pre>{log}</pre>
    </div>
  )
}
