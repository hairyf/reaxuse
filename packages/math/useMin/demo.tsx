import { useMin } from '@reause/math'
import { useState } from 'react'

export default function UseMinDemo() {
  const [value1, setValue1] = useState(1)
  const [value2, setValue2] = useState(3)
  const [value3, setValue3] = useState(5)

  const min = useMin(value1, value2, value3)

  return (
    <div>
      <p>
        value 1:
        {' '}
        <input
          type="number"
          value={value1}
          onChange={event => setValue1(Number(event.target.value))}
        />
      </p>
      <p>
        value 2:
        {' '}
        <input
          type="number"
          value={value2}
          onChange={event => setValue2(Number(event.target.value))}
        />
      </p>
      <p>
        value 3:
        {' '}
        <input
          type="number"
          value={value3}
          onChange={event => setValue3(Number(event.target.value))}
        />
      </p>
      <p>
        min:
        {' '}
        <strong>{min}</strong>
      </p>
    </div>
  )
}
