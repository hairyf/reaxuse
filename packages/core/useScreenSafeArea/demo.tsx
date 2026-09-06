import type { CSSProperties } from 'react'
import { useScreenSafeArea } from '@reaxuse/core'

const gridStyle: CSSProperties = {
  display: 'inline-grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: '1rem',
  rowGap: '0.5rem',
}

const labelStyle: CSSProperties = {
  opacity: 0.5,
}

export default function UseScreenSafeAreaDemo() {
  const {
    top,
    right,
    bottom,
    left,
  } = useScreenSafeArea()

  return (
    <div style={gridStyle}>
      <div style={labelStyle}>top:</div>
      <div>{top}</div>
      <div style={labelStyle}>right:</div>
      <div>{right}</div>
      <div style={labelStyle}>bottom:</div>
      <div>{bottom}</div>
      <div style={labelStyle}>left:</div>
      <div>{left}</div>
    </div>
  )
}
