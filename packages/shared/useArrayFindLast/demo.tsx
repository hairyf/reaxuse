import { useArrayFindLast } from '@reause/shared'
import { useState } from 'react'

export default function UseArrayFindLastDemo() {
  const [list, setList] = useState([-1, -2, 3])

  const positive = useArrayFindLast(list, val => val > 0)

  return (
    <div>
      <p>
        list:
        {' '}
        <strong>{`[${list.join(', ')}]`}</strong>
      </p>
      <p>
        last positive:
        {' '}
        <strong>{positive ?? 'none'}</strong>
      </p>
      <button onClick={() => setList([1, -2, 3])}>item1 = 1</button>
      <button onClick={() => setList([-1, -2, -3])}>item3 = -3</button>
    </div>
  )
}
