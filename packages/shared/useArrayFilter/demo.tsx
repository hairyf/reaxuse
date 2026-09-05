import { useArrayFilter } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseArrayFilterDemo() {
  const [list, setList] = useState([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  const evens = useArrayFilter(list, i => i % 2 === 0)

  return (
    <div>
      <p>
        list:
        {' '}
        <strong>{JSON.stringify(list)}</strong>
      </p>
      <p>
        evens:
        {' '}
        <strong>{JSON.stringify(evens)}</strong>
      </p>
      <button onClick={() => setList(list.slice(1))}>shift</button>
      <button onClick={() => setList([...list, list.length])}>push</button>
    </div>
  )
}
