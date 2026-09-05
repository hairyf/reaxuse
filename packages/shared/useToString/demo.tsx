import { useToString } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseToStringDemo() {
  const [number, setNumber] = useState(3.14)
  const str = useToString(number)

  return (
    <div>
      <p>
        str:
        {' '}
        <strong>{str}</strong>
      </p>
      <button onClick={() => setNumber(2.5)}>2.5</button>
      <button onClick={() => setNumber(123.345)}>123.345</button>
      <button onClick={() => setNumber(42)}>42</button>
    </div>
  )
}
