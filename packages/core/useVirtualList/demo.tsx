import type { CSSProperties } from 'react'
import { useVirtualList } from '@reaxuse/core'
import { useMemo, useState } from 'react'

const allItems = Array.from(Array.from({ length: 99999 }).keys())
  .map(i => ({
    height: i % 2 === 0 ? 42 : 84,
    size: i % 2 === 0 ? 'small' : 'large',
  }))

function rowStyle(height: number): CSSProperties {
  return {
    height,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottom: '1px solid rgba(107, 114, 128, 0.2)',
    boxSizing: 'border-box',
  }
}

export default function UseVirtualListDemo() {
  const [search, setSearch] = useState('')
  const [index, setIndex] = useState('')
  const [smoothScroll, setSmoothScroll] = useState(false)
  const [block, setBlock] = useState<ScrollLogicalPosition>('start')

  const filteredItems = useMemo(
    () => allItems.filter(i => i.size.startsWith(search.toLowerCase())),
    [search],
  )

  const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(
    filteredItems,
    {
      // Keep in sync with the item's row (row height + spacing).
      itemHeight: i => filteredItems[i].height + 8,
      overscan: 10,
    },
  )

  const handleScrollTo = () => {
    const value = Number(index)
    if (Number.isInteger(value))
      scrollTo(value, { behavior: smoothScroll ? 'smooth' : 'auto', block })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <form
        style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}
        onSubmit={(e) => {
          e.preventDefault()
          handleScrollTo()
        }}
      >
        <label>
          Jump to index
          <input
            type="number"
            placeholder="Index"
            style={{ marginLeft: 4 }}
            value={index}
            onChange={e => setIndex(e.target.value)}
          />
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <input
            type="checkbox"
            checked={smoothScroll}
            onChange={e => setSmoothScroll(e.target.checked)}
          />
          Smooth
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Block
          <select value={block} onChange={e => setBlock(e.target.value as ScrollLogicalPosition)}>
            {(['start', 'center', 'end', 'nearest'] as const).map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Filter by size
          <select value={search} onChange={e => setSearch(e.target.value)}>
            <option value="">
              All
            </option>
            <option value="small">
              Small
            </option>
            <option value="large">
              Large
            </option>
          </select>
        </label>
        <button type="submit">
          Go
        </button>
      </form>
      <div
        {...containerProps}
        style={{ ...containerProps.style, height: '300px', padding: 8, background: 'rgba(107, 114, 128, 0.1)', borderRadius: 4 }}
      >
        <div {...wrapperProps}>
          {list.map(item => (
            <div key={item.index} style={rowStyle(item.data.height)}>
              Row
              {' '}
              {item.index}
              <span style={{ opacity: 0.7, marginLeft: 4 }}>
                (
                {item.data.size}
                )
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
