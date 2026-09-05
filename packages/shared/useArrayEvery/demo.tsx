import { useArrayEvery } from '@reaxuse/shared'
import { useReducer, useRef } from 'react'

export default function UseArrayEveryDemo() {
  const item1 = useRef(0)
  const item2 = useRef(2)
  const item3 = useRef(4)
  const [, rerender] = useReducer(count => count + 1, 0)

  const allEven = useArrayEvery([item1, item2, item3], val => val % 2 === 0)

  return (
    <div>
      <p>
        list:
        {' '}
        <strong>{`[${item1.current}, ${item2.current}, ${item3.current}]`}</strong>
      </p>
      <p>
        all even:
        {' '}
        <strong>{allEven ? 'true' : 'false'}</strong>
      </p>
      <button
        onClick={() => {
          item1.current = item1.current % 2 === 0 ? 1 : 0
          rerender()
        }}
      >
        toggle item1
      </button>
    </div>
  )
}
