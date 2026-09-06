import { useShare } from '@reaxuse/core'
import { useState } from 'react'

export default function UseShareDemo() {
  const [text, setText] = useState('Collection of essential React Composition Utilities!')
  const { share, isSupported } = useShare({
    title: 'reaxuse',
    text,
    url: typeof location === 'undefined' ? '' : location.href,
  })

  function startShare() {
    return share().catch(err => err)
  }

  return (
    <div>
      {isSupported && (
        <input
          type="text"
          placeholder="Note"
          value={text}
          onChange={event => setText(event.target.value)}
        />
      )}
      <button disabled={!isSupported} onClick={startShare}>
        {isSupported ? 'Share' : 'Web share is not supported in your browser'}
      </button>
    </div>
  )
}
