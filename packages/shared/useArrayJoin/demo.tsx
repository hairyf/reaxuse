import { useArrayJoin } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseArrayJoinDemo() {
  const [list, setList] = useState(['foo', 0, { prop: 'val' }])
  const [separator, setSeparator] = useState('--')
  const joined = useArrayJoin(list, separator)

  return (
    <div>
      <p>
        joined:
        {' '}
        <strong>{joined}</strong>
      </p>
      <button onClick={() => setList([...list, 'bar'])}>add bar</button>
      <button onClick={() => setSeparator(',')}>separator ,</button>
      <button onClick={() => setSeparator('--')}>separator --</button>
    </div>
  )
}
