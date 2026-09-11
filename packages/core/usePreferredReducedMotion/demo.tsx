import { usePreferredReducedMotion } from '@reause/core'

export default function UsePreferredReducedMotionDemo() {
  const motion = usePreferredReducedMotion()

  return (
    <div>
      <p>
        Preferred Motion:
      </p>
      <code>{motion}</code>
    </div>
  )
}
