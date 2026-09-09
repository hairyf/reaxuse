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

    // the predicate is evaluated on the mount re-check and again whenever the
    // effect re-runs (e.g. after the visibility observer fires)
    await vi.waitFor(() => {
      expect(canLoadMoreSpy).toHaveBeenCalled()
    })
    expect(handlerSpy).not.toBeCalled()
  })

  it('should re-evaluate canLoadMore when the option is swapped', async () => {
    const handlerSpy = vi.fn()
    const canLoadMoreSpy1 = vi.fn(() => false)

    const screen = await render(<NarrowList onLoadMore={handlerSpy} canLoadMore={canLoadMoreSpy1} />)

    await vi.waitFor(() => {
      expect(canLoadMoreSpy1).toHaveBeenCalled()
    })
    expect(handlerSpy).not.toBeCalled()

    // swapping the predicate must be honored without touching the element
    const canLoadMoreSpy2 = vi.fn(() => true)
    await screen.rerender(<NarrowList onLoadMore={handlerSpy} canLoadMore={canLoadMoreSpy2} />)

    await vi.waitFor(() => {
      expect(canLoadMoreSpy2).toHaveBeenCalled()
    })
    // the new predicate now permits loading the shorter-than-viewport content
    await vi.waitFor(() => {
      expect(handlerSpy).toBeCalled()
    })
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
