import { unrefElement } from '@reaxuse/core'
import { useRef, useState } from 'react'

export default function UnrefElementDemo() {
  const target = useRef<HTMLDivElement | null>(null)
  const [fromRef, setFromRef] = useState('null')
  const [fromGetter, setFromGetter] = useState('null')

  const resolve = () => {
    const el = unrefElement(target)
    setFromRef(el ? `${el.tagName.toLowerCase()} — "${el.textContent}"` : 'null')
    const el2 = unrefElement(() => target.current)
    setFromGetter(el2 ? `${el2.tagName.toLowerCase()} — "${el2.textContent}"` : 'null')
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
        <strong>{fromRef}</strong>
      </p>
      <p>
        {'getter: '}
        <strong>{fromGetter}</strong>
      </p>
    </div>
  )
}
