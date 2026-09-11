import { useAsyncQueue } from '@reause/core'

function p1() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1000)
    }, 10)
  })
}

function p2(result: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(1000 + result)
    }, 20)
  })
}

export default function UseAsyncQueueDemo() {
  const { activeIndex, result } = useAsyncQueue([p1, p2])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div className="text-primary text-lg font-bold">
        activeIndex:
        {' '}
        {activeIndex}
      </div>
      <pre className="code-block">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  )
}
