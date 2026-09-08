import { useClamp } from '@reaxuse/math'
import { useState } from 'react'

export default function UseClampDemo() {
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(10)
  const [value, setValue] = useClamp(0, min, max)

  return (
    <div>
      <div>
        min:
        {' '}
        <input
          type="number"
          value={min}
          onChange={event => setMin(Number(event.target.value))}
        />
      </div>
      <div>
        max:
        {' '}
        <input
          type="number"
          value={max}
          onChange={event => setMax(Number(event.target.value))}
        />
      </div>
      <div>
        value:
        {' '}
        {value}
      </div>
      <div>
        <button onClick={() => setValue(value - 1)}>Decrement</button>
        <button onClick={() => setValue(value + 1)}>Increment</button>
      </div>
    </div>
  )
}
