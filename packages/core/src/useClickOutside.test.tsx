import { useRef } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { useClickOutside } from './useClickOutside'

function getComplexComponent(useGetter = false) {
  return function ComplexComponent() {
    const target = useRef<HTMLDivElement>(null)
    const outside = useRef<HTMLDivElement>(null)
    useClickOutside(
      useGetter ? () => target.current : target,
      (event) => {
        // Mirrors the upstream test which spies on `console.log`
        // eslint-disable-next-line no-console
        console.log(event)
      },
      {
        ignore: [outside],
      },
    )

    return (
      <div>
        <div ref={target}>
          Inside
        </div>

        <div ref={outside}>
          Outside
          <label>
            <input type="radio" />
            <span>Label</span>
          </label>
        </div>

        <div>
          Other
        </div>
      </div>
    )
  }
}

describe('useClickOutside', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('should work with ignored element', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const ComplexComponent = getComplexComponent()
    const screen = await render(<ComplexComponent />)
    const target = screen.getByText('Inside')
    const outside = screen.getByText('Outside', { exact: false })
    const label = screen.getByText('Label')
    const other = screen.getByText('Other')

    await expect.element(target).toBeInTheDocument()
    await expect.element(outside).toBeInTheDocument()
    expect(consoleSpy).not.toHaveBeenCalled()
    await userEvent.click(outside)
    expect(consoleSpy).not.toHaveBeenCalled()
    await userEvent.click(label)
    expect(consoleSpy).not.toHaveBeenCalled()
    await userEvent.click(other)
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('should detect iframe inside shadow DOM with detectIframe option', async () => {
    const handler = vi.fn()

    function IframeComponent() {
      const target = useRef<HTMLDivElement>(null)
      useClickOutside(target, handler, { detectIframe: true })
      return (
        <div ref={target}>
          Inside
        </div>
      )
    }

    const screen = await render(<IframeComponent />)
    await expect.element(screen.getByText('Inside')).toBeInTheDocument()

    const host = document.createElement('div')
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const iframe = document.createElement('iframe')
    shadowRoot.appendChild(iframe)
    document.body.appendChild(host)

    // Focus the iframe — a real click on it moves focus into the iframe and
    // fires window `blur`; in the browser test environment `iframe.focus()`
    // is the reliable way to produce that focus shift (the upstream nested
    // shadow DOM test uses the same `.focus()` call).
    iframe.focus()
    await vi.waitFor(() => {
      expect(handler).toHaveBeenCalledOnce()
    })
  })

  it('should detect iframe inside nested shadow DOM with detectIframe option', async () => {
    const handler = vi.fn()

    function IframeComponent() {
      const target = useRef<HTMLDivElement>(null)
      useClickOutside(target, handler, { detectIframe: true })
      return (
        <div ref={target}>
          Inside
        </div>
      )
    }

    const screen = await render(<IframeComponent />)
    await expect.element(screen.getByText('Inside')).toBeInTheDocument()

    // <outer-host> > shadow-root > <inner-host> > shadow-root > <iframe>
    const outerHost = document.createElement('div')
    const outerShadow = outerHost.attachShadow({ mode: 'open' })
    const innerHost = document.createElement('div')
    const innerShadow = innerHost.attachShadow({ mode: 'open' })
    const iframe = document.createElement('iframe')
    innerShadow.appendChild(iframe)
    outerShadow.appendChild(innerHost)
    document.body.appendChild(outerHost)

    // Playwright cannot click an iframe nested 2 levels deep in shadow DOM
    iframe.focus()
    await vi.waitFor(() => {
      expect(handler).toHaveBeenCalledOnce()
    })
  })

  it('allow the value of target to be a getter', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const ComplexComponent = getComplexComponent(true)
    const screen = await render(<ComplexComponent />)
    const target = screen.getByText('Inside')
    const other = screen.getByText('Other')

    await expect.element(target).toBeInTheDocument()
    await expect.element(other).toBeInTheDocument()
    expect(consoleSpy).not.toHaveBeenCalled()
    await userEvent.click(target)
    expect(consoleSpy).not.toHaveBeenCalled()
    await userEvent.click(other)
    expect(consoleSpy).toHaveBeenCalled()
  })
})
