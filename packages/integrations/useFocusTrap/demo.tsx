import { useFocusTrap } from '@reause/integrations'
import { useRef } from 'react'

export default function UseFocusTrapDemo() {
  const target = useRef<HTMLDivElement>(null)
  const { hasFocus, activate, deactivate } = useFocusTrap(target)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <button onClick={() => activate()}>
        {hasFocus ? 'Focus is trapped within form' : 'Trap focus within form'}
      </button>
      <input
        type="text"
        placeholder={hasFocus ? 'You can\'t focus me' : 'You can focus me'}
        style={{ width: '14rem' }}
      />

      <div
        ref={target}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '24rem',
          margin: '0 auto',
          padding: '2rem',
          border: hasFocus ? '2px solid #3fb983' : '2px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <div style={{ textAlign: 'center', fontSize: '2.5rem' }}>
          {hasFocus ? '🤨' : '😴'}
        </div>
        <input type="text" placeholder="Email" />
        <input type="text" placeholder="Nickname" />
        <input type="text" placeholder="Password" />
        <button onClick={() => deactivate()}>
          Free Focus
        </button>
      </div>
    </div>
  )
}
