import { useToNumber } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseToNumberDemo() {
  const [value, setValue] = useState('123.345')
  const float = useToNumber(value)
  const int = useToNumber(value, { method: 'parseInt' })

  return (
    <div>
      <p>
        value:
        {' '}
        <input value={value} onChange={event => setValue(event.target.value)} />
      </p>
      <p>
        parseFloat:
        {' '}
        <strong>{String(float)}</strong>
      </p>
      <p>
        parseInt:
        {' '}
        <strong>{String(int)}</strong>
      </p>
      <button onClick={() => setValue('Hi')}>Hi</button>
      <button onClick={() => setValue('0xFA')}>0xFA</button>
    </div>
  )
}
