import { useWindowSize } from '@reause/core'

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
