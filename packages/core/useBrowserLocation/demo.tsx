import { useBrowserLocation } from '@reaxuse/core'

export default function UseBrowserLocationDemo() {
  const location = useBrowserLocation()

  return (
    <div>
      <div>
        Input and hash will be changed:
        <input
          type="text"
          placeholder="Hash"
          value={location.hash}
          onChange={(e) => {
            location.hash = e.target.value
          }}
        />
      </div>
      <pre lang="json">{JSON.stringify(location, null, 2)}</pre>
    </div>
  )
}
