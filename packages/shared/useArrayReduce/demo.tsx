import { useArrayReduce } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseArrayReduceDemo() {
  const [list, setList] = useState([1, 2, 3, 4])
  const sum = useArrayReduce(list, (prev, item) => prev + item, 0)

  return (
    <div>
      <p>
        list:
        {' '}
        <strong>{JSON.stringify(list)}</strong>
      </p>
      <p>
        sum:
        {' '}
        <strong>{sum}</strong>
      </p>
      <button onClick={() => setList([...list, list.length + 1])}>push</button>
      <button onClick={() => setList(list.slice(0, -1))}>pop</button>
    </div>
  )
}
