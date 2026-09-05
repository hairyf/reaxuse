import { useTimeoutFn } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseTimeoutFnDemo() {
  const defaultText = 'Please wait for 1 second'
  const [text, setText] = useState(defaultText)
  const { isPending, start } = useTimeoutFn(() => setText('Fired!'), 1000)

  function restart() {
    setText(defaultText)
    start()
  }

  return (
    <div>
      <p>{text}</p>
      <button disabled={isPending} onClick={restart}>Restart</button>
    </div>
  )
}
