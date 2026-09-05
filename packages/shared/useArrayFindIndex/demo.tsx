import { useArrayFindIndex } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseArrayFindIndexDemo() {
  const [list, setList] = useState([0, 2, 4, 6, 8])
  const index = useArrayFindIndex(list, i => i % 2 === 0)

  return (
    <div>
      <p>
        list:
        {' '}
        <strong>
          [
          {list.join(', ')}
          ]
        </strong>
      </p>
      <p>
        index:
        {' '}
        <strong>{index}</strong>
      </p>
      <button onClick={() => setList(current => [1, ...current.slice(1)])}>make first odd</button>
      <button onClick={() => setList([0, 2, 4, 6, 8])}>reset</button>
    </div>
  )
}
