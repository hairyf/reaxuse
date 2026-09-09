import { useRefsList } from '@reaxuse/core'
import { useEffect, useState } from 'react'

export default function UseRefsListDemo() {
  const [count, setCount] = useState(3)
  const refs = useRefsList<HTMLSpanElement>()
  // the list is auto-reset on every render and re-collected during the
  // commit, so read it after the commit via an effect — reading it during
  // render would see the freshly cleared list
  const [snapshot, setSnapshot] = useState('refs.length: 0 · refs[0]: null')

  useEffect(() => {
    setSnapshot(`refs.length: ${refs.length} · refs[0]: ${refs[0]?.textContent?.trim() ?? 'null'}`)
  })

  const items = Array.from({ length: count }, (_, index) => index + 1)

  return (
    <div>
      <div>
        {items.map(item => (
          <span key={item} ref={el => refs.set(el)}>
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
      <div>{snapshot}</div>
    </div>
  )
}
