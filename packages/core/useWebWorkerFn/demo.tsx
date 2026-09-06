import { useTimestamp, useWebWorkerFn } from '@reaxuse/core'
import { useState } from 'react'

function heavyTask() {
  const randomNumber = () => Math.trunc(Math.random() * 5_000_00)
  const numbers: number[] = Array.from({ length: 5_000_000 }).fill(undefined).map(randomNumber)
  numbers.sort()
  return numbers.slice(0, 5)
}

// useDateFormat is not ported (yet), so the timestamp is formatted by hand
function formatTimestamp(timestamp: number) {
  const d = new Date(timestamp)
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(d.getMilliseconds(), 3)}`
}

export default function UseWebWorkerFnDemo() {
  const timestamp = useTimestamp()
  const { workerFn, workerStatus, workerTerminate } = useWebWorkerFn(heavyTask)
  const [data, setData] = useState<number[] | null>(null)
  const [runner, setRunner] = useState('')

  const running = workerStatus === 'RUNNING'

  const nextPaint = () => new Promise(resolve => setTimeout(resolve, 0))

  async function baseSort() {
    setData(null)
    await nextPaint()
    setData(heavyTask())
    setRunner('Main')
  }

  async function workerSort() {
    setData(null)
    await nextPaint()
    setData(await workerFn())
    setRunner('Worker')
  }

  return (
    <div>
      <p>
        Current Time:
        {' '}
        <b>{formatTimestamp(timestamp)}</b>
      </p>
      <p>
        This is a demo showing sort for large array (5 million numbers) with or w/o WebWorker.
        Clock stops when UI blocking happens.
      </p>
      <button onClick={() => { void baseSort() }}>
        Sort in Main Thread
      </button>
      {!running && <button onClick={() => { void workerSort() }}>Sort in Worker</button>}
      {running && <button onClick={() => workerTerminate('PENDING')}>Terminate Worker</button>}
      {data && (
        <p>
          Thread:
          {' '}
          <strong>{runner}</strong>
          <br />
          Result:
          {' '}
          <strong>{data.join(', ')}</strong>
        </p>
      )}
    </div>
  )
}
