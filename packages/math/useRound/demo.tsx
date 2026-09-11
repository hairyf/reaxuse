import { useRound } from '@reause/math'
import { useState } from 'react'

const PRESET_VALUES = [20.49, -20.51, 0.5, -0.5, 7, 3.1415]

export default function UseRoundDemo() {
  const [value, setValue] = useState(20.49)

  const result = useRound(value)

  return (
    <div>
      <p>
        value:
        {' '}
        <input
          type="number"
          step="0.001"
          value={value}
          onChange={event => setValue(Number(event.target.value))}
        />
      </p>
      <p>
        round:
        {' '}
        <strong>{String(result)}</strong>
      </p>
      <p>
        presets:
        {' '}
        {PRESET_VALUES.map(preset => (
          <button key={preset} onClick={() => setValue(preset)}>{String(preset)}</button>
        ))}
      </p>
    </div>
  )
}
