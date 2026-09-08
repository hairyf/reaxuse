import { useStartTyping } from '@reaxuse/core'
import { useRef } from 'react'

export default function UseStartTypingDemo() {
  const input = useRef<HTMLInputElement>(null)

  useStartTyping(() => {
    if (input.current !== document.activeElement)
      input.current?.focus()
  })

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm opacity-75">Type anything</p>
      <input ref={input} type="text" placeholder="Start typing to focus" />
      <input type="text" placeholder="Start typing has no effect here" />
    </div>
  )
}
