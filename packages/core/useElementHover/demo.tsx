import { useElementHover } from '@reause/core'
import { useRef } from 'react'

export default function UseElementHoverDemo() {
  const el = useRef<HTMLButtonElement>(null)
  const isHovered = useElementHover(el, { delayEnter: 200, delayLeave: 600 })

  return (
    <button
      ref={el}
      className="button small"
      style={{ padding: '0.5rem 1rem' }}
    >
      <span>{isHovered ? 'Thank you!' : 'Hover me'}</span>
    </button>
  )
}
