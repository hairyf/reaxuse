import { useStateHistory } from '@reaxuse/core'
import { useState } from 'react'

function format(ts: number) {
  const date = new Date(ts)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export default function UseStateHistoryDemo() {
  const [count, setCount] = useState(0)
  const [history, undo, redo, { canUndo, canRedo, setSource }] = useStateHistory(count, setCount, { capacity: 10 })

  return (
    <div>
      <p>
        Count:
        {' '}
        <strong>{count}</strong>
      </p>
      <button onClick={() => setSource(count + 1)}>Increment</button>
      <button onClick={() => setSource(count - 1)}>Decrement</button>
      <span>
        {' '}
        /
        {' '}
      </span>
      <button disabled={!canUndo} onClick={() => undo()}>Undo</button>
      <button disabled={!canRedo} onClick={() => redo()}>Redo</button>
      <p>History (limited to 10 records for demo)</p>
      <div>
        {history.map((record, index) => (
          <div key={`${record.timestamp}-${index}`}>
            <span>
              {format(record.timestamp)}
              {' '}
            </span>
            <span>{`{ value: ${String(record.snapshot)} }`}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
