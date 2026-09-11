import { logicNot } from '@reause/math'
import { useState } from 'react'

export default function LogicNotDemo() {
  const [value, setValue] = useState(true)

  const result = logicNot(value)

  return (
    <div>
      <p>
        value:
        {' '}
        <input
          type="checkbox"
          checked={value}
          onChange={event => setValue(event.target.checked)}
        />
      </p>
      <p>
        logicNot(value) =
        {' '}
        <strong>{String(result)}</strong>
      </p>
    </div>
  )
}
