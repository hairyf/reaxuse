import { useNow } from '@reaxuse/core'

export default function UseNowDemo() {
  const now = useNow()

  return (
    <div>
      Now:
      {' '}
      <strong>{now.toLocaleTimeString()}</strong>
    </div>
  )
}
