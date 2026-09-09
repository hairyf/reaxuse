import { useFavicon } from '@reaxuse/core'

export default function UseFaviconDemo() {
  const [, setIcon] = useFavicon('favicon-32x32.png', {
    baseUrl: '/',
    rel: 'icon',
  })

  return (
    <div>
      <div>
        Change favicon to
      </div>
      <button onClick={() => setIcon('vue.png')}>
        Vue
      </button>
      <button onClick={() => setIcon('favicon-32x32.png')}>
        VueUse
      </button>
    </div>
  )
}
