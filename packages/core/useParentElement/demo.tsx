import { useParentElement } from '@reaxuse/core'
import { useRef } from 'react'

export default function UseParentElementDemo() {
  const childRef = useRef<HTMLDivElement>(null)
  const parent = useParentElement(childRef)

  return (
    <div>
      <p>
        {'Parent element tag: '}
        <strong>{parent ? parent.tagName : 'Finding...'}</strong>
      </p>
      <div style={{ border: '1px solid #3eaf7c', padding: '12px' }}>
        <div ref={childRef}>
          child element
        </div>
      </div>
    </div>
  )
}
