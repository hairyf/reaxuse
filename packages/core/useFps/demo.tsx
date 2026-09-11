import { useFps } from '@reause/core'

export default function UseFpsDemo() {
  const fps = useFps()

  return (
    <div>
      <p>
        FPS:
        {' '}
        <strong>{fps}</strong>
      </p>
    </div>
  )
}
