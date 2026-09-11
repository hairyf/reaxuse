import { useStateDefault } from '@reause/shared'
import { useState } from 'react'

// externally-controlled ref-like source — `value` reflects its current value,
// falling back to the default while it is `undefined`
const raw: { current: string | undefined } = { current: undefined }

export default function UseStateDefaultDemo() {
  const [value, setValue] = useStateDefault(raw, 'default')
  const [input, setInput] = useState('')

  const update = (next: string) => {
    setInput(next)
    setValue(next)
  }

  return (
    <div>
      <input
        type="text"
        value={input}
        placeholder="Type anything, then clear..."
        onChange={event => update(event.target.value)}
      />
      <p>
        Current:
        {' '}
        <strong>{value}</strong>
      </p>
      <p>
        Raw source (raw.current):
        {' '}
        {raw.current === undefined ? 'undefined' : raw.current}
      </p>
      <button
        onClick={() => {
          setInput('')
          setValue(undefined)
        }}
      >
        Clear
      </button>
      <p>
        While the source is undefined, the value falls back to the default.
      </p>
    </div>
  )
}
