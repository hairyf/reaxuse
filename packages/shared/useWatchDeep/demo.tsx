import { useWatchDeep } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseWatchDeepDemo() {
  const [obj, setObj] = useState({ foo: { bar: { deep: 5 } } })
  const [logs, setLogs] = useState<string[]>([])

  useWatchDeep(obj, (value) => {
    setLogs(prev => [...prev, `foo.bar.deep → ${value.foo.bar.deep}`])
  })

  return (
    <div>
      <p>
        foo.bar.deep:
        {' '}
        <strong>{obj.foo.bar.deep}</strong>
      </p>
      <button onClick={() => setObj({ foo: { bar: { deep: obj.foo.bar.deep + 1 } } })}>update nested</button>
      <button onClick={() => setObj({ foo: { bar: { deep: obj.foo.bar.deep } } })}>reassign deep-equal</button>
      <p>
        watched changes:
        {' '}
        {logs.length > 0 ? logs.join(', ') : 'none yet'}
      </p>
    </div>
  )
}
