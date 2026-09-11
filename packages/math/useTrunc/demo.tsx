import { useTrunc } from '@reause/math'
import { useState } from 'react'

const PRESET_VALUES = [0.95, -0.2, 7.004, -2.34]

export default function UseTruncDemo() {
  const [value, setValue] = useState(0.95)

  const result = useTrunc(value)

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
