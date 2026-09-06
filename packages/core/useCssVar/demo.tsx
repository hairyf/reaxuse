import type { CSSProperties } from 'react'
import { useCssVar } from '@reaxuse/core'
import { useState } from 'react'

export default function UseCssVarDemo() {
  // state-held element refs: React refs don't re-render when populated, so the
  // element (which starts as `null`) is kept in state to re-resolve the target
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  const [color, setColor] = useCssVar('--color', el)

  function switchColor() {
    setColor(current => (current === '#df8543' ? '#7fa998' : '#df8543'))
  }

  const [elv, setElv] = useState<HTMLDivElement | null>(null)
  const [key, setKey] = useState('--color')
  const [colorVal] = useCssVar(key, elv)

  function changeVar() {
    setKey(current => (current === '--color' ? '--color-one' : '--color'))
  }

  return (
    <div>
      <div ref={setEl} style={{ '--color': '#7fa998', 'color': 'var(--color)' } as CSSProperties}>
        {`Sample text, ${color}`}
      </div>
      <button onClick={switchColor}>
        Change Color
      </button>
      <div ref={setElv} style={{ '--color': '#7fa998', '--color-one': '#df8543', 'color': colorVal } as CSSProperties}>
        {`Sample text, ${key}: ${colorVal}`}
      </div>
      <button onClick={changeVar}>
        Change Color Variable
      </button>
    </div>
  )
}
