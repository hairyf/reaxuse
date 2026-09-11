import { useActiveElement } from '@reause/core'

export default function UseActiveElementDemo() {
  const activeElement = useActiveElement()
  const key = activeElement?.dataset?.id || 'null'

  return (
    <div>
      <p style={{ marginBlockEnd: '0.75rem' }}>Select the inputs below to see the changes</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <input
            key={i}
            type="text"
            data-id={i}
            placeholder={`${i}`}
            style={{ margin: '0', minWidth: '0' }}
          />
        ))}
      </div>
      <div style={{ marginTop: '8px' }}>
        Current Active Element:
        {' '}
        <strong>{key}</strong>
      </div>
    </div>
  )
}
