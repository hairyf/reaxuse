import { useFavicon } from '@reaxuse/core'
import { useState } from 'react'

export default function UseFaviconDemo() {
  const [url, setUrl] = useState('favicon-32x32.png')

  useFavicon(url, {
    baseUrl: '/',
    rel: 'icon',
  })

  return (
    <div>
      <div>
        Change favicon to
      </div>
      <button onClick={() => setUrl('vue.png')}>
        Vue
      </button>
      <button onClick={() => setUrl('favicon-32x32.png')}>
        VueUse
      </button>
    </div>
  )
}
