import { useToggle } from '@reaxuse/core'

export default function UseToggleDemo() {
  const [value, toggle] = useToggle()

  return (
    <div>
      <p>
        value: <strong>{String(value)}</strong>
      </p>
      <button onClick={() => toggle()}>toggle</button>
      <button onClick={() => toggle(false)}>set false</button>
    </div>
  )
}
