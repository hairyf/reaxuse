import { useFloor } from '@reaxuse/math'
import { useState } from 'react'

export default function UseFloorDemo() {
  const [value, setValue] = useState(45.95)
  const result = useFloor(value)

  return (
    <div>
      <div>
        <input
          id="input"
          type="range"
          min={-100}
          max={100}
          step="0.05"
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
        floor:
        {' '}
        <strong>{String(result)}</strong>
      </div>
    </div>
  )
}
