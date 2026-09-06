import { useWatchImmediate } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchImmediateDemo() {
  const [text, setText] = useState('vue-use')
  const [logs, setLogs] = useState<string[]>([])

  // Fires immediately with the current value, then again on every change —
  // so 'vue-use' is logged before you even touch the input.
  useWatchImmediate(text, (updated) => {
    setLogs(prev => [...prev, updated])
  })

  return (
    <div>
      <input value={text} onChange={e => setText(e.target.value)} />
      <p>
        logged (immediate + on change):
        {' '}
        {logs.length > 0 ? logs.join(' → ') : 'nothing yet'}
      </p>
    </div>
  )
}
