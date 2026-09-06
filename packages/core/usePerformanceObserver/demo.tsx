import { usePerformanceObserver } from '@reaxuse/core'
import { useState } from 'react'

export default function UsePerformanceObserverDemo() {
  const [entrys, setEntrys] = useState<PerformanceEntry[]>([])

  usePerformanceObserver(
    { entryTypes: ['paint'], buffered: true },
    (list) => {
      setEntrys(list.getEntries())
    },
  )

  function refresh() {
    window.location.reload()
  }

  return (
    <div>
      <button type="button" onClick={refresh}>
        refresh
      </button>
      <pre>{JSON.stringify(entrys, null, 2)}</pre>
    </div>
  )
}
