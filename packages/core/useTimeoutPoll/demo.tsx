import { useTimeoutPoll } from '@reaxuse/core'
import { useState } from 'react'

export default function UseTimeoutPollDemo() {
  const [count, setCount] = useState(0)

  async function fetchData() {
    await new Promise(resolve => setTimeout(resolve, 1000))
    setCount(c => c + 1)
  }

  // Only trigger after last fetch is done
  const { isActive, pause, resume } = useTimeoutPoll(fetchData, 1000)

  return (
    <div>
      <p>
        Count:
        {' '}
        <strong>{count}</strong>
      </p>
      <p>
        isActive:
        {' '}
        <strong>{String(isActive)}</strong>
      </p>
      <button onClick={pause}>pause</button>
      <button onClick={resume}>resume</button>
    </div>
  )
}
