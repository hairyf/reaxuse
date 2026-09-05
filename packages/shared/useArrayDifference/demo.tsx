import { useArrayDifference } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseArrayDifferenceDemo() {
  const [list, setList] = useState([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }])
  const [other, setOther] = useState([{ id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }])

  const diff = useArrayDifference(list, other, 'id', { symmetric: true })

  return (
    <div>
      <p>
        list ids:
        {' '}
        <strong>{JSON.stringify(list.map(item => item.id))}</strong>
      </p>
      <p>
        other ids:
        {' '}
        <strong>{JSON.stringify(other.map(item => item.id))}</strong>
      </p>
      <p>
        symmetric difference:
        {' '}
        <strong>{JSON.stringify(diff.map(item => item.id))}</strong>
      </p>
      <button onClick={() => setOther([{ id: 1 }, { id: 2 }])}>
        set other to ids 1, 2
      </button>
      <button onClick={() => setOther([{ id: 6 }, { id: 7 }])}>
        set other to ids 6, 7
      </button>
      <button onClick={() => setList([{ id: 6 }, { id: 7 }])}>
        set list to ids 6, 7
      </button>
    </div>
  )
}
