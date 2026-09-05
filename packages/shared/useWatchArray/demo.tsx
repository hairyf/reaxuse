import { useWatchArray } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchArrayDemo() {
  const [list, setList] = useState([1, 2, 3])
  const [logs, setLogs] = useState<string[]>([])

  useWatchArray(list, (newList, oldList, added, removed) => {
    setLogs(prev => [
      ...prev,
      `[${oldList.join(', ')}] → [${newList.join(', ')}] (added: ${added.join(', ') || 'none'}, removed: ${removed.join(', ') || 'none'})`,
    ])
  })

  return (
    <div>
      <p>
        list:
        {' '}
        <strong>{`[${list.join(', ')}]`}</strong>
      </p>
      <button onClick={() => setList([...list, list.length + 1])}>push</button>
      <button onClick={() => setList(list.slice(0, -1))}>pop</button>
      <p>
        watched changes:
        {' '}
        {logs.length > 0 ? logs.join(' | ') : 'none yet'}
      </p>
    </div>
  )
}
