import { useTimestamp } from '@reaxuse/core'

export default function UseTimestampDemo() {
  const timestamp = useTimestamp()

  return (
    <p>
      timestamp:
      {' '}
      <strong>{timestamp}</strong>
    </p>
  )
}
