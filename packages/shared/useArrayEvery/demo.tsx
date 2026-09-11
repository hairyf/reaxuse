import { useArrayEvery } from '@reause/shared'
import { useState } from 'react'

export default function UseArrayEveryDemo() {
  const [list, setList] = useState([0, 2, 4])

  const allEven = useArrayEvery(list, val => val % 2 === 0)

  return (
    <div>
      <p>
        list:
        {' '}
        <strong>{`[${list.join(', ')}]`}</strong>
      </p>
      <p>
        all even:
        {' '}
        <strong>{allEven ? 'true' : 'false'}</strong>
      </p>
      <button
        onClick={() => setList(current => (current[0] % 2 === 0 ? [1, ...current.slice(1)] : [0, ...current.slice(1)]))}
      >
        toggle item1
      </button>
    </div>
  )
}
