import { usePreferredReducedTransparency } from '@reause/core'

export default function UsePreferredReducedTransparencyDemo() {
  const transparency = usePreferredReducedTransparency()

  return (
    <div>
      <p>
        Preferred Transparency:
      </p>
      <code>{transparency}</code>
    </div>
  )
}
