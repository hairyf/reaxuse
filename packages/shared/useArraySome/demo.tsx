import { useArraySome } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseArraySomeDemo() {
  const [list, setList] = useState([0, 2, 4, 6, 8])
  const result = useArraySome(list, i => i > 10)

  return (
    <div>
      <p>
        list:
        {' '}
        <strong>{`[${list.join(', ')}]`}</strong>
      </p>
      <p>
        {'some(i => i > 10): '}
        <strong>{String(result)}</strong>
      </p>
      <button onClick={() => setList([...list, 11])}>add 11</button>
      <button onClick={() => setList([0, 2, 4, 6, 8])}>reset</button>
    </div>
  )
}
