import { useRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { useInfiniteScroll } from '../useInfiniteScroll'

describe('useInfiniteScroll', () => {
  it('should be defined', () => {
    expect(useInfiniteScroll).toBeDefined()
  })

  it('basic usage', async () => {
    const handlerSpy = vi.fn()

    function BasicComponent() {
      const el = useRef<HTMLDivElement>(null)
      const [data, setData] = useState<number[]>([])

      useInfiniteScroll(el, () => {
        handlerSpy()
        setData(d => [...d, d.length])
      })

      return (
        <div data-testid="scroller" ref={el} style={{ height: 50, overflow: 'auto' }}>
          <div style={{ height: 100 }} />
          {data.map(i => (
            <div key={i} style={{ height: 100 }} />
          ))}
        </div>
      )
    }

    const screen = await render(<BasicComponent />)
    const scroller = screen.getByTestId('scroller')
    await expect.element(scroller).toBeVisible()

    const el = () => scroller.query() as HTMLDivElement

    // one 100px item in a 50px viewport — not scrolled to the bottom yet
    expect(el().scrollHeight).toBe(100)
    await vi.waitFor(() => {
      expect(handlerSpy).not.toBeCalled()
    })

    // scroll near the top: still not at the bottom, no load
    el().scrollTo({ top: 20 })
    el().dispatchEvent(new Event('scroll'))
    await vi.waitFor(() => {
      expect(handlerSpy).not.toBeCalled()
    })

    // scroll to the bottom (max scrollTop = 50) → onLoadMore fires
    el().scrollTo({ top: 50 })
    el().dispatchEvent(new Event('scroll'))

    await vi.waitFor(() => {
      expect(handlerSpy).toBeCalled()
    })
    // the item appended by onLoadMore grows the content to 200px
    await vi.waitFor(() => {
      expect(el().scrollHeight).toBe(200)
    })
  })

  it('should not call loadMore when canLoadMore returns false', async () => {
    const handlerSpy = vi.fn()
    const canLoadMoreSpy = vi.fn(() => false)

    // content is exactly as tall as the viewport, so without the guard the
    // (shorter-than-viewport) check would trigger onLoadMore immediately
    await render(<NarrowList onLoadMore={handlerSpy} canLoadMore={canLoadMoreSpy} />)

    await vi.waitFor(() => {
      expect(canLoadMoreSpy).toHaveBeenCalledOnce()
    })
    expect(handlerSpy).not.toBeCalled()
  })
})

function NarrowList({ onLoadMore, canLoadMore }: {
  onLoadMore: () => void
  canLoadMore: () => boolean
}) {
  const el = useRef<HTMLDivElement>(null)
  useInfiniteScroll(el, onLoadMore, { canLoadMore })

  return (
    <div ref={el} style={{ height: 50, overflow: 'auto' }}>
      <div style={{ height: 50 }} />
    </div>
  )
}
