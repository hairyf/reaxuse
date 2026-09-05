import { useArrayIncludes } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseArrayIncludesDemo() {
  const [list, setList] = useState([{ id: 1 }, { id: 2 }, { id: 3 }])
  const [value, setValue] = useState(2)

  const includes = useArrayIncludes(list, value, 'id')

  return (
    <div>
      <p>
        list:
        {' '}
        <strong>{`[${list.map(item => item.id).join(', ')}]`}</strong>
      </p>
      <p>
        {`includes id ${value}:`}
        {' '}
        <strong>{includes ? 'true' : 'false'}</strong>
      </p>
      <button onClick={() => setValue(current => current === 2 ? 4 : 2)}>
        toggle search value
      </button>
      <button onClick={() => setList(current => current.slice(0, -1))}>pop</button>
    </div>
  )
}
