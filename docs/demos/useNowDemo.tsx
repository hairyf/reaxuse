import { useNow } from '@reaxuse/core'

export default function UseNowDemo() {
  const now = useNow(1000)

  return (
    <div>
      <p>
        now: <strong>{new Date(now).toLocaleTimeString()}</strong>
      </p>
    </div>
  )
}
