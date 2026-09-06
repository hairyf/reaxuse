import { useMemory } from '@reaxuse/core'

function size(v: number) {
  const kb = v / 1024 / 1024
  return `${kb.toFixed(2)} MB`
}

export default function UseMemoryDemo() {
  const { isSupported, memory } = useMemory()

  return (
    <div>
      {isSupported && memory
        ? (
            <table style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ opacity: 0.5, paddingRight: 16 }}>Used</td>
                  <td>{size(memory.usedJSHeapSize)}</td>
                </tr>
                <tr>
                  <td style={{ opacity: 0.5, paddingRight: 16 }}>Allocated</td>
                  <td>{size(memory.totalJSHeapSize)}</td>
                </tr>
                <tr>
                  <td style={{ opacity: 0.5, paddingRight: 16 }}>Limit</td>
                  <td>{size(memory.jsHeapSizeLimit)}</td>
                </tr>
              </tbody>
            </table>
          )
        : (
            <div>Your browser does not support performance memory API</div>
          )}
    </div>
  )
}
