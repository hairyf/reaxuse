import { useTimeAgoIntl } from '@reaxuse/core'
import { useState } from 'react'

export default function UseTimeAgoIntlDemo() {
  const [slider, setSlider] = useState(0)
  const value = Date.now() + slider ** 3
  const timeAgoIntl = useTimeAgoIntl(value, { locale: 'en' })
  const timeAgoIntlZh = useTimeAgoIntl(value, { locale: 'zh' })

  return (
    <div>
      <p className="text-center">
        {`English: ${timeAgoIntl}, Chinese: ${timeAgoIntlZh}`}
      </p>
      <input
        className="slider w-full opacity-80"
        max="3800"
        min="-3800"
        onChange={event => setSlider(Number(event.target.value))}
        type="range"
        value={slider}
      />
      <p className="text-center opacity-50">
        {`${slider ** 3}ms`}
      </p>
    </div>
  )
}
