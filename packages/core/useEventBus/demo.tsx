import { useEventBus } from '@reause/core'
import { useEffect, useState } from 'react'

const news = [
  'Su Bingtian broke the Asian record and entered the Olympic 100-meter race finals as the first person in China-RTHK',
  'Comprehensive investigation in Zhengzhou to avoid further spread of the epidemic-RTHK',
  '130 stroke experts after vaccination: nothing to do with the vaccine',
  'China adds two gold medals in Olympic diving and weightlifting',
  'Tokyo Olympic service provokes athletes sleeping in cardboard suitcases and eating canned food, reviewing the Beijing Olympics god-level arrangements',
]

export default function UseEventBusDemo() {
  // `useEventBus` is a pure factory — hold the bus in state so `on`/`emit`
  // stay identity-stable across renders.
  const [bus] = useState(() => useEventBus<string>('vue-use-event-bus'))
  const [message, setMessage] = useState('')

  useEffect(() => {
    return bus.on(_message => setMessage(news[Math.floor(Math.random() * news.length)]!))
  }, [bus])

  return (
    <div style={{ display: 'flex', gap: '100px' }}>
      <div>
        <div className="whitespace-nowrap">
          News channel:
        </div>
        <button type="button" className="whitespace-nowrap" onClick={() => bus.emit('The Tokyo Olympics has begun')}>
          Broadcast
        </button>
      </div>
      <div>
        <div style={{ marginBottom: '13px' }}>
          Television:
        </div>
        <div>{message || '--- no signal ---'}</div>
      </div>
    </div>
  )
}
