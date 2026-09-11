import { usePreferredColorScheme } from '@reause/core'

export default function UsePreferredColorSchemeDemo() {
  const colorScheme = usePreferredColorScheme()

  return (
    <div>
      <p>
        Preferred Color Scheme:
      </p>
      <code>{colorScheme}</code>
    </div>
  )
}
