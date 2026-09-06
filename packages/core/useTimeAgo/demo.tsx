import { useTimeAgo } from '@reaxuse/core'
import { useState } from 'react'

export default function UseTimeAgoDemo() {
  const [slider, setSlider] = useState(0)
  const value = Date.now() + slider ** 3
  const timeAgo = useTimeAgo(value)

  return (
    <div>
      <p className="text-center">{timeAgo}</p>
      <input
        className="slider w-full opacity-80"
        max="3800"
        min="-3800"
        onChange={event => setSlider(Number(event.target.value))}
        type="range"
        value={slider}
      />
      <p className="text-center opacity-50">{`${slider ** 3}ms`}</p>
    </div>
  )
}
