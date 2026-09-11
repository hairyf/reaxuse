import { useUnmount } from '@reause/shared'
import { useState } from 'react'

function Logger({ onUnmount }: { onUnmount: () => void }) {
  useUnmount(onUnmount)
  return <span>child mounted</span>
}

export default function UseUnmountDemo() {
  const [mounted, setMounted] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  return (
    <div>
      <p>
        {mounted
          ? <Logger onUnmount={() => setLogs(prev => [...prev, 'unmounted'])} />
          : <span>child unmounted</span>}
      </p>
      <p>
        unmount events:
        {' '}
        <strong>{logs.length}</strong>
      </p>
      <button onClick={() => setMounted(value => !value)}>
        {mounted ? 'unmount' : 'remount'}
      </button>
    </div>
  )
}
