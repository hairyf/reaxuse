import { useUpdate } from '@reaxuse/shared'
import { useRef } from 'react'

export default function UseUpdateDemo() {
  const update = useUpdate()
  const renders = useRef(0)
  renders.current += 1

  return (
    <div>
      <p>
        render count:
        {' '}
        <strong>{renders.current}</strong>
      </p>
      <button onClick={() => update()}>update</button>
    </div>
  )
}
