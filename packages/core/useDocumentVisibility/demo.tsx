import { useDocumentVisibility } from '@reause/core'
import { useTimeoutFn } from '@reause/shared'
import { useEffect, useRef, useState } from 'react'

export default function UseDocumentVisibilityDemo() {
  const startMessage = '💡 Minimize the page or switch tab then return'
  const [message, setMessage] = useState(startMessage)
  const visibility = useDocumentVisibility()

  const { start } = useTimeoutFn(() => {
    setMessage(startMessage)
  }, 3000)

  const previous = useRef(visibility)
  useEffect(() => {
    if (visibility === 'visible' && previous.current === 'hidden') {
      setMessage('🎉 Welcome back!')
      start()
    }
    previous.current = visibility
  }, [start, visibility])

  return (
    <div>
      <p>{message}</p>
    </div>
  )
}
