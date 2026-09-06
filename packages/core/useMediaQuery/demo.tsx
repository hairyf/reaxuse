import { useMediaQuery } from '@reaxuse/core'

export default function UseMediaQueryDemo() {
  const isLargeScreen = useMediaQuery('(min-width: 1024px)')
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  return (
    <div>
      <p>
        Is Large Screen:
      </p>
      <code>{String(isLargeScreen)}</code>
      <p>
        Prefers Dark:
      </p>
      <code>{String(prefersDark)}</code>
    </div>
  )
}
