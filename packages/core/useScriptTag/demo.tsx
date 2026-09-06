import { useScriptTag } from '@reaxuse/core'

export default function UseScriptTagDemo() {
  const { scriptTag, load, unload } = useScriptTag(
    'https://player.twitch.tv/js/embed/v1.js',
    () => {},
  )

  return (
    <div>
      <p>
        {'script is '}
        <strong>{scriptTag ? 'loaded' : 'not loaded'}</strong>
      </p>
      <p>
        <button type="button" onClick={() => { load() }}>
          Load Script
        </button>
        <button type="button" style={{ marginLeft: '8px' }} onClick={() => { unload() }}>
          Unload Script
        </button>
      </p>
    </div>
  )
}
