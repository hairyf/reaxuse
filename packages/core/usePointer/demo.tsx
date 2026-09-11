import { usePointer } from '@reause/core'

export default function UsePointerDemo() {
  const pointer = usePointer()

  return (
    <pre style={{ touchAction: 'none', userSelect: 'none' }}>
      {JSON.stringify(pointer, null, 2)}
    </pre>
  )
}
