import { useControllableState } from '@reause/shared'
import { useState } from 'react'

export default function UseControllableStateDemo() {
  // tuple state: `value` is the external value and `setValue` writes through to `setExternal`
  const [external, setExternal] = useState('controlled')
  const [value, setValue] = useControllableState([external, setExternal])

  // passive plain-value state: initialized from the source, local updates persist
  const [draft, setDraft] = useControllableState('draft', { passive: true })

  return (
    <div>
      <p>
        controlled:
        {' '}
        {value}
      </p>
      <input value={value} onChange={e => setValue(e.target.value)} />
      <p>
        uncontrolled:
        {' '}
        {draft}
      </p>
      <button onClick={() => setDraft(`draft ${Math.floor(Math.random() * 100)}`)}>Update draft</button>
    </div>
  )
}
