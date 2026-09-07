import type { CSSProperties } from 'react'
import { useElementByPoint, useMouse } from '@reaxuse/core'
import { useMemo } from 'react'

const panelStyle: CSSProperties = {
  minHeight: 96,
  margin: '8px 0',
  padding: '8px 12px',
  borderRadius: 4,
  background: 'rgba(107, 114, 128, 0.1)',
}

function describeElement(element: HTMLElement | HTMLElement[] | null): string | null {
  if (!element)
    return null
  if (Array.isArray(element)) {
    if (element.length === 0)
      return '(none)'
    return element.map(el => `${el.tagName.toLowerCase()}.${el.className || ''}`).join(' , ')
  }
  return `${element.tagName.toLowerCase()}.${element.className || ''}`
}

export default function UseElementByPointDemo() {
  const { x, y } = useMouse({ type: 'client' })
  const { element, isSupported, isActive, pause, resume } = useElementByPoint({ x, y })

  const elementDescription = useMemo(
    () => describeElement(element),
    [element],
  )

  return (
    <div>
      <p>
        Move the mouse to inspect the element under the cursor.
        {' '}
        {isSupported ? 'elementFromPoint is supported.' : 'elementFromPoint is not supported.'}
      </p>
      <pre style={panelStyle}>
        {JSON.stringify({ x, y, element: elementDescription, isActive }, null, 2)}
      </pre>
      <button type="button" onClick={pause}>Pause</button>
      {' '}
      <button type="button" onClick={resume}>Resume</button>
    </div>
  )
}
