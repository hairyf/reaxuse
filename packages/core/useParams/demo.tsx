import { useParams } from '@reaxuse/core'
import { useState } from 'react'

export default function UseParamsDemo() {
  // `T` is inferred from the default, so a `''` literal would narrow the
  // setter to `(value: '') => void` — pin `T` to `string` explicitly
  const [userId, setUserId] = useParams<string>('userId', '', { pattern: '/users/:userId' })
  const [draft, setDraft] = useState('')

  return (
    <div>
      <p>
        {'userId: '}
        <code>{userId || '(empty)'}</code>
      </p>
      <p>
        <input
          type="text"
          placeholder="42"
          value={draft}
          onChange={event => setDraft(event.target.value)}
        />
        <button type="button" onClick={() => setUserId(draft)}>setUserId</button>
        <button type="button" onClick={() => setUserId('')}>clear</button>
      </p>
      <p>
        The value stays in sync with the address bar: edit the path directly
        (e.g. `/users/42`) or use the back/forward buttons.
      </p>
    </div>
  )
}
