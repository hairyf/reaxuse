import { useToggle } from '@reause/shared'

export default function UseToggleDemo() {
  const [value, toggle] = useToggle()

  return (
    <div>
      <p>
        Value:
        {' '}
        {value ? 'ON' : 'OFF'}
      </p>
      <button onClick={() => toggle()}>Toggle</button>
      <button onClick={() => toggle(true)}>Set ON</button>
      <button onClick={() => toggle(false)}>Set OFF</button>
    </div>
  )
}
