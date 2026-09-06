import { useWindowSize } from '@reaxuse/core'

export default function UseWindowSizeDemo() {
  const { width, height } = useWindowSize()

  return (
    <div>
      <p>
        {width}
        {' x '}
        {height}
      </p>
    </div>
  )
}
