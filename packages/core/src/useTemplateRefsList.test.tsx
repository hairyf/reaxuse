import type { TemplateRefsList } from './useTemplateRefsList'
import { useState } from 'react'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useTemplateRefsList } from './useTemplateRefsList'

describe('useTemplateRefsList', () => {
  it('should be defined', () => {
    expect(useTemplateRefsList).toBeDefined()
  })

  it('returns a `[refs, setAt]` tuple with an empty initial list (issue-specified API)', async () => {
    const { result } = await renderHook(() => useTemplateRefsList<HTMLDivElement>())

    expectTypeOf(result.current).toEqualTypeOf<[TemplateRefsList<HTMLDivElement>, (index: number, value: HTMLDivElement | null) => void]>()

    const [refs, setAt] = result.current
    expect(Array.isArray(refs)).toBe(true)
    expect(refs.length).toBe(0)
    expect(typeof setAt).toBe('function')
    expect(typeof refs.setAt).toBe('function')
  })

  it('tuple setAt and refs.setAt are the same function with the same behavior', async () => {
    const { result } = await renderHook(() => useTemplateRefsList<HTMLDivElement>())
    const [refs, setAt] = result.current

    expect(setAt).toBe(refs.setAt)

    const el = document.createElement('div')
    // the attached method writes the slot...
    refs.setAt(0, el)
    expect(refs[0]).toBe(el)

    // ...and so does the detached tuple setter, including `null`
    setAt(0, null)
    expect(refs[0]).toBeNull()
    expect(setAt(1, el)).toBeUndefined()
    expect(refs[1]).toBe(el)
  })

  it('setAt writes elements into their slots', async () => {
    const { result } = await renderHook(() => useTemplateRefsList<HTMLDivElement>())
    const [refs, setAt] = result.current

    const first = document.createElement('div')
    const second = document.createElement('div')

    expect(setAt(0, first)).toBeUndefined()
    expect(setAt(1, second)).toBeUndefined()

    expect(refs[0]).toBe(first)
    expect(refs[1]).toBe(second)
    expect(refs.length).toBe(2)

    // overwriting a slot replaces only that slot
    const replacement = document.createElement('div')
    setAt(1, replacement)
    expect(refs[0]).toBe(first)
    expect(refs[1]).toBe(replacement)
  })

  it('setAt accepts null to clear a slot (element unmount)', async () => {
    const { result } = await renderHook(() => useTemplateRefsList<HTMLDivElement>())
    const [refs, setAt] = result.current

    const el = document.createElement('div')
    setAt(0, el)
    expect(refs[0]).toBe(el)

    setAt(0, null)
    expect(refs[0]).toBeNull()
  })

  it('collects elements bound via ref callbacks inside a rendered list', async () => {
    const ITEMS = ['alpha', 'beta', 'gamma']
    let refs: TemplateRefsList<HTMLLIElement> | undefined

    function List() {
      const [list, setAt] = useTemplateRefsList<HTMLLIElement>()
      refs = list

      return (
        <ul>
          {ITEMS.map((item, index) => (
            <li key={item} ref={el => setAt(index, el)}>
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

  it('collects new elements when the rendered list grows', async () => {
    let refs: TemplateRefsList<HTMLDivElement> | undefined

    function List({ count }: { count: number }) {
      const [list, setAt] = useTemplateRefsList<HTMLDivElement>()
      refs = list

      return (
        <div>
          {Array.from({ length: count }, (_, index) => (
            <div key={index} ref={el => setAt(index, el)}>
              {`div${index}`}
            </div>
          ))}
        </div>
      )
    }

    const screen = await render(<List count={3} />)
    await expect.element(screen.getByText('div2')).toBeVisible()
    expect(refs?.length).toBe(3)

    await screen.rerender(<List count={4} />)
    await expect.element(screen.getByText('div3')).toBeVisible()
    expect(refs?.length).toBe(4)
    expect(refs?.[3]?.textContent).toBe('div3')
  })

  it('sets the slot to null when an element unmounts', async () => {
    let refs: TemplateRefsList<HTMLDivElement> | undefined

    function Probe({ mounted }: { mounted: boolean }) {
      const [list, setAt] = useTemplateRefsList<HTMLDivElement>()
      refs = list

      return (
        <div>
          {mounted && <div ref={el => setAt(0, el)}>target</div>}
        </div>
      )
    }

    const screen = await render(<Probe mounted={true} />)
    await expect.element(screen.getByText('target')).toBeVisible()
    expect(refs?.[0]).toBeInstanceOf(HTMLDivElement)

    await screen.rerender(<Probe mounted={false} />)
    expect(refs?.[0]).toBeNull()
  })

  it('keeps the refs array identity stable across re-renders', async () => {
    const snapshots: TemplateRefsList<HTMLLIElement>[] = []

    function Probe() {
      const [refs, setAt] = useTemplateRefsList<HTMLLIElement>()
      const [tick, setTick] = useState(0)
      snapshots.push(refs)

      return (
        <div>
          <ul>
            {['a', 'b'].map((item, index) => (
              <li key={item} ref={el => setAt(index, el)}>
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
})

// upstream's `call child component methods` test mounts ref callbacks on child
// components (Vue forwards them natively) — React component refs need
// forwardRef plumbing outside this hook's scope, so that case is intentionally
// not ported; the element-level ref-callback collection is covered above.
