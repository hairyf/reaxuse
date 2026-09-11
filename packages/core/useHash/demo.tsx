import { useHash } from '@reause/core'
import { useState } from 'react'

export default function UseHashDemo() {
  const [hash, setHash] = useHash('default-hash')
  const [draft, setDraft] = useState('')

  return (
    <div>
      <p>
        {'Hash: '}
        <code>{hash}</code>
      </p>
      <p>
        <input
          type="text"
          placeholder="foobar"
          value={draft}
          onChange={event => setDraft(event.target.value)}
        />
        <button type="button" onClick={() => setHash(draft)}>setHash</button>
        <button type="button" onClick={() => setHash('')}>clear</button>
      </p>
      <p>
        The value stays in sync with the address bar: edit the fragment directly
        or use the back/forward buttons.
      </p>
    </div>
  )
}
