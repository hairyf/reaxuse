import { useFavicon } from '@reaxuse/core'
import { useState } from 'react'

export default function UseFaviconDemo() {
  const [type, setType] = useState<'vue' | 'vueuse'>('vueuse')

  // mirroring the upstream `computed` source: a getter re-read on re-render
  const favicon = () => (type === 'vue' ? 'vue.png' : 'favicon-32x32.png')

  useFavicon(favicon, {
    baseUrl: '/',
    rel: 'icon',
  })

  return (
    <div>
      <div>
        Change favicon to
      </div>
      <button onClick={() => setType('vue')}>
        Vue
      </button>
      <button onClick={() => setType('vueuse')}>
        VueUse
      </button>
    </div>
  )
}
