import { usePreferredDark } from '@reaxuse/core'

export default function UsePreferredDarkDemo() {
  const prefersDark = usePreferredDark()

  return (
    <div>
      <p>
        Prefers Dark:
      </p>
      <code>{String(prefersDark)}</code>
    </div>
  )
}
