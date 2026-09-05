import { useArrayMap } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseArrayMapDemo() {
  const [list, setList] = useState([0, 1, 2, 3, 4])
  const result = useArrayMap(list, i => i * 2)

  return (
    <div>
      <p>
        list:
        {' '}
        <strong>{JSON.stringify(list)}</strong>
      </p>
      <p>
        mapped:
        {' '}
        <strong>{JSON.stringify(result)}</strong>
      </p>
      <button onClick={() => setList(list.slice(0, -1))}>pop</button>
      <button onClick={() => setList([...list, list.length])}>push</button>
    </div>
  )
}
