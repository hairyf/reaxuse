import type { CSSProperties } from 'react'
import { useInfiniteScroll } from '@reause/core'
import { useRef, useState } from 'react'

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 16,
  width: 300,
  height: 300,
  margin: 'auto',
  overflowY: 'auto',
  background: 'rgba(107, 114, 128, 0.1)',
  borderRadius: 4,
}

const itemStyle: CSSProperties = {
  height: 64,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(107, 114, 128, 0.1)',
  borderRadius: 4,
}

export default function UseInfiniteScrollDemo() {
  const el = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<number[]>([])

  const { reset } = useInfiniteScroll(
    el,
    async () => {
      const length = data.length + 1
      // keep a small delay so the batched re-measure behaves like loading
      await new Promise(resolve => setTimeout(resolve, 300))
      setData(d => [...d, ...Array.from({ length: 5 }, (_, i) => length + i)])
    },
    {
      distance: 10,
      canLoadMore: () => {
        // indicate when there is no more content to load so onLoadMore stops triggering
        // if (noMoreContent) return false
        return true // for demo purposes
      },
    },
  )

  function resetList() {
    setData([])
    reset()
  }

  return (
    <>
      <div ref={el} style={containerStyle}>
        {data.map(item => (
          <div key={item} style={itemStyle}>
            {item}
          </div>
        ))}
      </div>
      <div style={{ margin: 'auto', width: 300, padding: 8 }}>
        <button type="button" onClick={resetList}>
          Reset
        </button>
      </div>
    </>
  )
}
