import { useTimeoutFn } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseTimeoutFnDemo() {
  const [text, setText] = useState('Click Start to fire after 1 second')
  const { isPending, start } = useTimeoutFn(() => setText('Fired!'), 1000, { immediate: false })

  return (
    <div>
      <p>{text}</p>
      <button disabled={isPending} onClick={start}>Start</button>
    </div>
  )
}
