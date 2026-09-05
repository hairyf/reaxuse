import { useUnmount } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseUnmountDemo() {
  const [mounted, setMounted] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  useUnmount(() => setLogs(prev => [...prev, 'unmounted']))

  if (!mounted) {
    return (
      <div>
        <p>
          unmounted
          {' '}
          {logs.length > 0 ? `· ${logs[logs.length - 1]}` : ''}
        </p>
        <button onClick={() => setMounted(true)}>remount</button>
      </div>
    )
  }

  return (
    <div>
      <p>
        mounted
        {' '}
        {logs.length > 0 ? `· last: ${logs[logs.length - 1]}` : ''}
      </p>
      <button onClick={() => setMounted(false)}>unmount</button>
    </div>
  )
}
