import type { CSSProperties, ReactNode } from 'react'
import { useKeyModifier } from '@reaxuse/core'

function Key({ value, children }: { value: boolean | null, children: ReactNode }) {
  const active = value === true
  const style: CSSProperties = {
    fontFamily: 'monospace',
    padding: '8px 16px',
    borderRadius: 4,
    textAlign: 'center',
    opacity: active ? 1 : 0.5,
    color: active ? 'rgb(66 184 131)' : 'inherit',
    background: active ? 'rgba(66, 184, 131, 0.15)' : 'rgba(128, 128, 128, 0.1)',
  }
  return <div style={style}>{children}</div>
}

export default function UseKeyModifierDemo() {
  const capsLock = useKeyModifier('CapsLock')
  const numLock = useKeyModifier('NumLock')
  const scrollLock = useKeyModifier('ScrollLock')
  const shift = useKeyModifier('Shift')
  const control = useKeyModifier('Control')
  const alt = useKeyModifier('Alt')

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 8,
      }}
    >
      <Key value={capsLock}>capsLock</Key>
      <Key value={numLock}>numLock</Key>
      <Key value={scrollLock}>scrollLock</Key>
      <Key value={shift}>shift</Key>
      <Key value={control}>control</Key>
      <Key value={alt}>alt</Key>
    </div>
  )
}
