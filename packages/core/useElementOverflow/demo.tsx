import { useElementOverflow } from '@reaxuse/core'
import { useRef, useState } from 'react'

export default function UseElementOverflowDemo() {
  const overflowRef = useRef<HTMLDivElement | null>(null)
  const { isXOverflowed } = useElementOverflow(overflowRef, { observeMutation: true })
  const [input, setInput] = useState('some words here')
  const [width, setWidth] = useState(200)

  return (
    <div>
      <div>content:</div>
      <input
        type="text"
        value={input}
        onChange={event => setInput(event.target.value)}
      />
      <div>width:</div>
      <input
        type="range"
        min={0}
        step={1}
        max={200}
        value={width}
        onChange={event => setWidth(Number(event.target.value))}
      />
      <div>display:</div>
      <div
        ref={overflowRef}
        style={{ width: `${width}px`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        <b>{input}</b>
      </div>
      <br />
      <div>
        isOverflowed:
        {' '}
        <strong>{isXOverflowed ? 'true' : 'false'}</strong>
      </div>
    </div>
  )
}
