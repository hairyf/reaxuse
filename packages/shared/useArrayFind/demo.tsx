import { useArrayFind } from '@reaxuse/shared'
import { useReducer, useRef } from 'react'

export default function UseArrayFindDemo() {
  const item1 = useRef(-1)
  const item2 = useRef(-2)
  const item3 = useRef(3)
  const [, rerender] = useReducer(count => count + 1, 0)

  const positive = useArrayFind([item1, item2, item3], val => val > 0)

  return (
    <div>
      <p>
        list:
        {' '}
        <strong>{`[${item1.current}, ${item2.current}, ${item3.current}]`}</strong>
      </p>
      <p>
        first positive:
        {' '}
        <strong>{positive ?? 'none'}</strong>
      </p>
      <button
        onClick={() => {
          item1.current = 1
          rerender()
        }}
      >
        item1 = 1
      </button>
      <button
        onClick={() => {
          item3.current = -3
          rerender()
        }}
      >
        item3 = -3
      </button>
    </div>
  )
}
