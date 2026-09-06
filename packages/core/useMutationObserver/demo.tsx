import { useMutationObserver } from '@reaxuse/core'
import { useEffect, useRef, useState } from 'react'

export default function UseMutationObserverDemo() {
  const el = useRef<HTMLDivElement | null>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [className, setClassName] = useState<Record<string, boolean>>({})
  const [style, setStyle] = useState<Record<string, string>>({})

  useMutationObserver(el, (mutations) => {
    const mutation = mutations[0]

    if (!mutation)
      return

    setMessages(prev => [...prev, mutation.attributeName!])
  }, { attributes: true })

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setClassName({ test: true, test2: true })
    }, 1000)
    const timer2 = setTimeout(() => {
      setStyle({ color: 'red' })
    }, 1550)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div>
      <div
        ref={el}
        className={Object.keys(className).filter(key => className[key]).join(' ')}
        style={style}
      >
        {messages.map((text, index) => (
          <div key={index}>
            Mutation Attribute:
            {' '}
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}
