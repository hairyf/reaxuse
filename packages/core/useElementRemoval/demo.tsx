import { useElementRemoval } from '@reause/core'
import { useRef, useState } from 'react'

export default function UseElementRemovalDemo() {
  // demo1: recreate new element
  const demo1Ref = useRef<HTMLButtonElement | null>(null)
  const [demo1State, setDemo1State] = useState(true)
  const [demo1Count, setDemo1Count] = useState(0)

  useElementRemoval(demo1Ref, () => setDemo1Count(count => count + 1))

  // demo2: reuse same element
  const demo2ParentRef = useRef<HTMLSpanElement | null>(null)
  const demo2Ref = useRef<HTMLSpanElement | null>(null)
  const [demo2State, setDemo2State] = useState(true)
  const [demo2Count, setDemo2Count] = useState(0)

  useElementRemoval(demo2Ref, () => setDemo2Count(count => count + 1))

  function demo2BtnOnClick() {
    const next = !demo2State
    const target = demo2Ref.current

    setDemo2State(next)

    if (!target)
      return

    if (next)
      demo2ParentRef.current?.appendChild(target)
    else
      target.remove()
  }

  return (
    <div>
      <h3>demo1: recreate new element</h3>
      <div>
        {demo1State
          ? (
              <button ref={demo1Ref} onClick={() => setDemo1State(false)}>
                remove me
              </button>
            )
          : (
              <button onClick={() => setDemo1State(true)}>
                recreate me
              </button>
            )}
        <div>
          <b>
            removed times:
            {' '}
            {demo1Count}
          </b>
        </div>
      </div>

      <hr />

      <h3>demo2: reuse same element</h3>
      <button onClick={demo2BtnOnClick}>
        {demo2State ? 'remove' : 'append'}
        {' me'}
      </button>
      <span ref={demo2ParentRef}>
        <span ref={demo2Ref}>target element</span>
      </span>
      <div>
        <b>
          removed times:
          {' '}
          {demo2Count}
        </b>
      </div>
    </div>
  )
}
