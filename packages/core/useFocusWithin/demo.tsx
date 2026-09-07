import { useFocusWithin } from '@reaxuse/core'
import { useRef } from 'react'

function BooleanDisplay({ value }: { value: boolean }) {
  return (
    <strong>
      {value ? 'true' : 'false'}
    </strong>
  )
}

export default function UseFocusWithinDemo() {
  const target = useRef<HTMLFormElement>(null)
  const { focused } = useFocusWithin(target)

  return (
    <div>
      <form
        ref={target}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '24rem',
          margin: '0 auto',
          padding: '2rem',
          border: focused ? '2px solid #3fb983' : '2px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <input type="text" placeholder="First Name" style={{ padding: '4px 8px' }} />
        <input type="text" placeholder="Last Name" style={{ padding: '4px 8px' }} />
        <input type="text" placeholder="Email" style={{ padding: '4px 8px' }} />
        <input type="text" placeholder="Password" style={{ padding: '4px 8px' }} />
      </form>
      <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
        Focus in form:
        {' '}
        <BooleanDisplay value={focused} />
      </div>
    </div>
  )
}
