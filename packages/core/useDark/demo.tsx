import { useDark } from '@reause/core'

export default function UseDarkDemo() {
  const [isDark, toggleDark] = useDark()

  return (
    <button onClick={toggleDark}>
      {isDark ? 'Dark' : 'Light'}
    </button>
  )
}
