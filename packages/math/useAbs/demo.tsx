import { useAbs } from '@reause/math'
import { useState } from 'react'

export default function UseAbsDemo() {
  const [value, setValue] = useState(-23)
  const result = useAbs(value)

  return (
    <div>
      <div>
        <input
          id="input"
          type="range"
          min={-100}
          max={100}
          value={value}
          onChange={event => setValue(Number(event.target.value))}
        />
      </div>
      <div>
        value:
        {' '}
        {value}
      </div>
      <div>
        abs:
        {' '}
        <strong>{String(result)}</strong>
      </div>
    </div>
  )
}
