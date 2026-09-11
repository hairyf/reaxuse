import { useTimestamp } from '@reause/core'

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
