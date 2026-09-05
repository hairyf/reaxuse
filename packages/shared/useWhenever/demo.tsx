import { useWhenever } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWheneverDemo() {
  const [value, setValue] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  useWhenever(value, v => setLogs(prev => [...prev, `truthy: "${v}"`]))

  return (
    <div>
      <p>
        Whenever the input value is truthy, it gets logged:
      </p>
      <input
        value={value}
        placeholder="type something…"
        onChange={event => setValue(event.target.value)}
      />
      {' '}
      <button onClick={() => setValue('')}>clear</button>
      <ul>
        {logs.map((log, index) => <li key={index}>{log}</li>)}
      </ul>
    </div>
  )
}
