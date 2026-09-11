import { unrefElement } from '@reause/core'
import { useRef, useState } from 'react'

export default function UnrefElementDemo() {
  const target = useRef<HTMLDivElement | null>(null)
  const [resolved, setResolved] = useState('null')

  const resolve = () => {
    const el = unrefElement(target)
    setResolved(el ? `${el.tagName.toLowerCase()} — "${el.textContent}"` : 'null')
  }
  return (
    <div>
      <div
        ref={target}
        style={{
          padding: '8px',
          background: 'rgba(0, 0, 0, .05)',
          border: '1px solid rgba(0, 0, 0, .1)',
        }}
      >
        <strong>hello unrefElement</strong>
      </div>
      <p>
        <button onClick={resolve}>Resolve unrefElement</button>
      </p>
      <p>
        {'ref-like: '}
        <strong>{resolved}</strong>
      </p>
    </div>
  )
}
