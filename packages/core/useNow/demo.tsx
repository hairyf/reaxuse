import { useNow } from '@reause/core'

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
