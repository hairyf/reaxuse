import { useTemplateRefsList } from '@reaxuse/core'
import { useState } from 'react'

export default function UseTemplateRefsListDemo() {
  const [count, setCount] = useState(3)
  const [refs, setAt] = useTemplateRefsList<HTMLSpanElement>()
  // mutating `refs` never re-renders — bump a state tick to read the slots
  // after the latest commit
  const [, setRenderTick] = useState(0)

  const items = Array.from({ length: count }, (_, index) => index + 1)

  return (
    <div>
      <div>
        {items.map((item, index) => (
          <span key={item} ref={el => setAt(index, el)}>
            {item}
            {' '}
          </span>
        ))}
      </div>
      <br />
      <button type="button" onClick={() => setCount(c => c + 1)}>
        Inc
      </button>
      <button type="button" disabled={count <= 0} onClick={() => setCount(c => c - 1)}>
        Dec
      </button>
      <button type="button" onClick={() => setRenderTick(t => t + 1)}>
        Refresh
      </button>
      <div>
        refs.length:
        {' '}
        {refs.length}
      </div>
      <div>
        refs[0]:
        {' '}
        {refs[0]?.textContent.trim() ?? 'null'}
      </div>
    </div>
  )
}
