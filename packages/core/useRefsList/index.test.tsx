import type { TemplateRefsList } from '../useRefsList'
import { useState } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { configure } from 'vitest-browser-react/pure'
import { useRefsList } from '../useRefsList'

describe('useRefsList', () => {
  it('should be defined', () => {
    expect(useRefsList).toBeDefined()
  })

  it('returns the refs list itself — a plain `T[]` carrying the `set(el)` collector (issue-specified API)', async () => {
    const { result } = await renderHook(() => useRefsList<HTMLDivElement>())

    expectTypeOf(result.current).toEqualTypeOf<TemplateRefsList<HTMLDivElement>>()

    expect(Array.isArray(result.current)).toBe(true)
    expect(result.current.length).toBe(0)
    expect(typeof result.current.set).toBe('function')
  })

  it('refs.set collects elements in order and ignores `null` (upstream `if (el) push`)', async () => {
    const { result } = await renderHook(() => useRefsList<HTMLDivElement>())
    const refs = result.current

    const first = document.createElement('div')
    const second = document.createElement('div')

    refs.set(first)
    refs.set(null) // unmount / callback detach — never stored
    refs.set(second)

    expect(refs.length).toBe(2)
    expect(refs[0]).toBe(first)
    expect(refs[1]).toBe(second)
    // the list never contains null slots
    expect(refs.every(el => el !== null)).toBe(true)
  })

  it('refs.set is idempotent for the same element (StrictMode / re-collect safety)', async () => {
    const { result } = await renderHook(() => useRefsList<HTMLDivElement>())
    const refs = result.current

    const el = document.createElement('div')
    refs.set(el)
    refs.set(el) // e.g. React StrictMode double-invokes the attach
    refs.set(el)

    expect(refs.length).toBe(1)
    expect(refs[0]).toBe(el)
  })

  it('collects elements bound via ref callbacks inside a rendered list', async () => {
    const ITEMS = ['alpha', 'beta', 'gamma']
    let refs: TemplateRefsList<HTMLLIElement> | undefined

    function List() {
      const list = useRefsList<HTMLLIElement>()
      refs = list

      return (
        <ul>
          {ITEMS.map(item => (
            <li key={item} ref={el => list.set(el)}>
              {item}
            </li>
          ))}
        </ul>
      )
    }

    const screen = await render(<List />)
    await expect.element(screen.getByText('beta')).toBeVisible()

    expect(refs?.length).toBe(3)
    expect(refs?.[0]?.textContent).toBe('alpha')
    expect(refs?.[1]?.textContent).toBe('beta')
    expect(refs?.[2]?.textContent).toBe('gamma')
  })

  it('auto-resets on re-render so grow/shrink never leave a stale length or a null tail', async () => {
    let refs: TemplateRefsList<HTMLDivElement> | undefined

    function List({ count }: { count: number }) {
      const list = useRefsList<HTMLDivElement>()
      refs = list

      return (
        <div>
          {Array.from({ length: count }, (_, index) => (
            <div key={index} ref={el => list.set(el)}>
              {`div${index}`}
            </div>
          ))}
        </div>
      )
    }

    const screen = await render(<List count={3} />)
    await expect.element(screen.getByText('div2')).toBeVisible()
    expect(refs?.length).toBe(3)

    // grow: the new element is collected and length follows the live count
    await screen.rerender(<List count={4} />)
    await expect.element(screen.getByText('div3')).toBeVisible()
    expect(refs?.length).toBe(4)
    expect(refs?.[3]?.textContent).toBe('div3')

    // shrink: no stale tail, no null slots — length equals the elements that
    // are actually mounted (upstream `onBeforeUpdate` clear)
    await screen.rerender(<List count={2} />)
    await expect.element(screen.getByText('div1')).toBeVisible()
    expect(refs?.length).toBe(2)
    expect(refs?.[0]?.textContent).toBe('div0')
    expect(refs?.[1]?.textContent).toBe('div1')
    expect(refs?.every(el => el !== null)).toBe(true)
  })

  it('drops an individually unmounted element with the remaining ones kept in order', async () => {
    let refs: TemplateRefsList<HTMLDivElement> | undefined

    function Probe({ mounted }: { mounted: boolean }) {
      const list = useRefsList<HTMLDivElement>()
      refs = list

      return (
        <div>
          {[0, 1, 2].map((n) => {
            if (n === 1 && !mounted)
              return null
            return (
              <div key={n} ref={el => list.set(el)}>
                {`div${n}`}
              </div>
            )
          })}
        </div>
      )
    }

    const screen = await render(<Probe mounted={true} />)
    await expect.element(screen.getByText('div2')).toBeVisible()
    expect(refs?.length).toBe(3)

    await screen.rerender(<Probe mounted={false} />)
    await expect.element(screen.getByText('div2')).toBeVisible()
    expect(refs?.length).toBe(2)
    // the unmounted element is gone; no `null` slot remains in the list
    expect(refs?.[0]?.textContent).toBe('div0')
    expect(refs?.[1]?.textContent).toBe('div2')
    expect(refs?.every(el => el !== null)).toBe(true)
  })

  it('an unmounted subtree leaves the list empty instead of a null slot', async () => {
    let refs: TemplateRefsList<HTMLDivElement> | undefined

    function Probe({ mounted }: { mounted: boolean }) {
      const list = useRefsList<HTMLDivElement>()
      refs = list

      return (
        <div>
          {mounted && <div ref={el => list.set(el)}>target</div>}
        </div>
      )
    }

    const screen = await render(<Probe mounted={true} />)
    await expect.element(screen.getByText('target')).toBeVisible()
    expect(refs?.[0]).toBeInstanceOf(HTMLDivElement)

    await screen.rerender(<Probe mounted={false} />)
    // upstream auto-reset: nothing is mounted, so nothing is collected
    expect(refs?.length).toBe(0)
  })

  it('re-collects after an unrelated re-render (ref callbacks re-fire)', async () => {
    let refs: TemplateRefsList<HTMLLIElement> | undefined

    function Probe() {
      const list = useRefsList<HTMLLIElement>()
      refs = list
      const [tick, setTick] = useState(0)

      return (
        <div>
          <ul>
            {['a', 'b'].map(item => (
              <li key={item} ref={el => list.set(el)}>
                {item}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setTick(t => t + 1)}>
            increment
            {tick}
          </button>
        </div>
      )
    }

    const screen = await render(<Probe />)
    await expect.element(screen.getByText(/increment/)).toBeVisible()
    expect(refs?.length).toBe(2)

    // an unrelated state update re-renders the component; the inline ref
    // callbacks re-fire and re-populate the list (this is why a manual
    // `refs.length = 0` reset is never needed — it would instead leave the
    // list empty until the next commit)
    await screen.getByText(/increment/).click()
    await expect.element(screen.getByText(/increment/)).toBeVisible()
    expect(refs?.length).toBe(2)
    expect(refs?.[0]?.textContent).toBe('a')
    expect(refs?.[1]?.textContent).toBe('b')
  })

  it('keeps the refs array identity stable across re-renders', async () => {
    const snapshots: TemplateRefsList<HTMLLIElement>[] = []

    function Probe() {
      const refs = useRefsList<HTMLLIElement>()
      const [tick, setTick] = useState(0)
      snapshots.push(refs)

      return (
        <div>
          <ul>
            {['a', 'b'].map(item => (
              <li key={item} ref={el => refs.set(el)}>
                {item}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setTick(t => t + 1)}>
            increment
            {tick}
          </button>
        </div>
      )
    }

    const screen = await render(<Probe />)
    await expect.element(screen.getByText(/increment/)).toBeVisible()
    const initial = snapshots[0]
    expect(initial?.length).toBe(2)

    // a state update re-renders the component, but the container is the very
    // same array object across every render
    await screen.getByText(/increment/).click()
    await expect.element(screen.getByText(/increment/)).toBeVisible()
    expect(snapshots.length).toBeGreaterThan(1)
    for (const refs of snapshots)
      expect(refs).toBe(initial)

    // slots still hold their elements after the re-render
    expect(initial?.[0]?.textContent).toBe('a')
    expect(initial?.[1]?.textContent).toBe('b')
  })

  it('collects each element exactly once under React StrictMode (dev double-attach)', async () => {
    configure({ reactStrictMode: true })
    try {
      let refs: TemplateRefsList<HTMLDivElement> | undefined

      function Probe() {
        const list = useRefsList<HTMLDivElement>()
        refs = list

        return (
          <div>
            {['s1', 's2', 's3'].map(n => (
              <div key={n} ref={el => list.set(el)}>
                {n}
              </div>
            ))}
          </div>
        )
      }

      const screen = await render(<Probe />)
      await expect.element(screen.getByText('s3')).toBeVisible()
      expect(refs?.length).toBe(3)
      expect(new Set(refs).size).toBe(3)
    }
    finally {
      configure({ reactStrictMode: false })
    }
  })
})

// upstream's `call child component methods` test mounts ref callbacks on child
// components (Vue forwards them natively) — React component refs need
// forwardRef plumbing outside this hook's scope, so that case is intentionally
// not ported; the element-level ref-callback collection is covered above.
