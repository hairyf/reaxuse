import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { SSRWidthProvider, useSSRWidth } from '../useSSRWidth'

/** Wrapper component handing every rendered hook the same provider width. */
function wrapper({ children }: { children: ReactNode }) {
  return <SSRWidthProvider width={500}>{children}</SSRWidthProvider>
}

describe('useSSRWidth', () => {
  it('should be defined', () => {
    expect(useSSRWidth).toBeDefined()
    expect(SSRWidthProvider).toBeDefined()
  })

  it('should be undefined by default (no provider — mirrors upstream)', async () => {
    const { result } = await renderHook(() => useSSRWidth())

    expect(result.current[0]).toBeUndefined()
    expect(result.current[1]).toBeTypeOf('function')
  })

  it('setWidth is a no-op outside a provider (no provider state to write)', async () => {
    const { result, act } = await renderHook(() => useSSRWidth())

    await act(() => {
      result.current[1](500)
    })

    expect(result.current[0]).toBeUndefined()
  })

  it('should provide the set value through the provider', async () => {
    const { result } = await renderHook(() => useSSRWidth(), { wrapper })

    expect(result.current[0]).toBe(500)
  })

  it('setWidth writes through to the provider state and clears with null', async () => {
    const { result, act } = await renderHook(() => useSSRWidth(), { wrapper })

    expect(result.current[0]).toBe(500)

    await act(() => {
      result.current[1](800)
    })
    expect(result.current[0]).toBe(800)

    // upstream `provideSSRWidth(null)` — not a number, so readers see undefined
    await act(() => {
      result.current[1](null)
    })
    expect(result.current[0]).toBeUndefined()
  })

  it('reaches every consumer below the provider and stays in sync across them', async () => {
    function Reader() {
      const [width] = useSSRWidth()
      return <div>{width ?? 'none'}</div>
    }

    function Writer() {
      const [, setWidth] = useSSRWidth()
      return (
        <button type="button" onClick={() => setWidth(1024)}>
          set width
        </button>
      )
    }

    const screen = await render(
      <SSRWidthProvider width={500}>
        <Reader />
        <Writer />
      </SSRWidthProvider>,
    )

    await expect.element(screen.getByText('500')).toBeVisible()

    await screen.getByRole('button', { name: 'set width' }).click()

    await expect.element(screen.getByText('1024')).toBeVisible()
  })

  it('re-syncs when the width prop changes', async () => {
    function Probe() {
      const [width] = useSSRWidth()
      return <div>{width ?? 'none'}</div>
    }

    const screen = await render(
      <SSRWidthProvider width={500}>
        <Probe />
      </SSRWidthProvider>,
    )

    await expect.element(screen.getByText('500')).toBeVisible()

    await screen.rerender(
      <SSRWidthProvider width={700}>
        <Probe />
      </SSRWidthProvider>,
    )

    await expect.element(screen.getByText('700')).toBeVisible()
  })

  it('treats an omitted / null width as "no simulated width"', async () => {
    function Probe() {
      const [width] = useSSRWidth()
      return <div>{width ?? 'none'}</div>
    }

    const screen = await render(
      <SSRWidthProvider>
        <Probe />
      </SSRWidthProvider>,
    )

    await expect.element(screen.getByText('none')).toBeVisible()

    await screen.rerender(
      <SSRWidthProvider width={null}>
        <Probe />
      </SSRWidthProvider>,
    )

    await expect.element(screen.getByText('none')).toBeVisible()
  })

  it('is SSR safe — renderToString produces the provider width without effects', () => {
    function SSRProbe() {
      const [width] = useSSRWidth()
      return <div>{width ?? 'none'}</div>
    }

    // server render runs the render phase only (no effects, no client APIs):
    // both the provider and the hook are pure context reads, so no `window`
    // is dereferenced and the markup already carries the simulated width
    const html = renderToString(
      <SSRWidthProvider width={500}>
        <SSRProbe />
      </SSRWidthProvider>,
    )
    expect(html).toContain('500')

    // without a provider the server renders the upstream "nothing provided"
    // default, which is what the client then hydrates
    const htmlWithoutProvider = renderToString(<SSRProbe />)
    expect(htmlWithoutProvider).toContain('none')
  })
})
