import { usePreferredContrast } from '@reaxuse/core'

export default function UsePreferredContrastDemo() {
  const contrast = usePreferredContrast()

  return (
    <div>
      <p>
        Preferred Contrast:
      </p>
      <code>{contrast}</code>
    </div>
  )
}
