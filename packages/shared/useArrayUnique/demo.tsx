import { useArrayUnique } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseArrayUniqueDemo() {
  const [list, setList] = useState([0, 2, 2, 4, 4, 4])
  const result = useArrayUnique(list)

  return (
    <div>
      <p>
        list:
        {' '}
        <strong>{`[${list.join(', ')}]`}</strong>
      </p>
      <p>
        {'unique: '}
        <strong>{`[${result.join(', ')}]`}</strong>
      </p>
      <button onClick={() => setList([0, 2, 4, 6, 6])}>add 6, 6</button>
      <button onClick={() => setList([0, 2, 2, 4, 4, 4])}>reset</button>
    </div>
  )
}
