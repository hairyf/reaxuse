import { useWebWorker } from '@reaxuse/core'
import { useState } from 'react'

// self-contained worker source (an in-worker counter that returns n + 1),
// loaded from a blob URL so the demo ships as a single file
const incrementWorkerSource = `
  self.onmessage = (e) => {
    self.postMessage(Number(e.data) + 1)
  }
`

export default function UseWebWorkerDemo() {
  const [workerUrl] = useState(() => URL.createObjectURL(new Blob([incrementWorkerSource], { type: 'text/javascript' })))
  const { data, post, terminate, worker } = useWebWorker<number>(workerUrl)

  return (
    <div>
      <p>
        {'Count from worker: '}
        <strong>{data ?? 0}</strong>
      </p>
      <button onClick={() => post((data ?? 0) + 1)}>
        Increment in worker
      </button>
      <button onClick={() => terminate()}>
        Terminate worker
      </button>
      <p>
        {worker ? 'worker is mounted' : 'worker not mounted yet'}
      </p>
    </div>
  )
}
