import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { createPromisifiedComponent } from '../createPromisifiedComponent'

describe('createPromisifiedComponent', () => {
  it('should be defined', () => {
    expect(createPromisifiedComponent).toBeDefined()
  })

  // Mirror of the upstream test: `start(args)` awaited from a handler, the
  // template renders `args[0]` and `resolve(val)` settles the promise.
  // Divergence: upstream resolves during the slot render (Vue tolerates
  // in-render mutation); React requires resolve from an event handler.
  it('should work', async () => {
    const str = 'Hello world' // <- expected arg to template
    const val = Math.random() // <- expected resolved value

    const TemplatePromise = createPromisifiedComponent<number, [string]>()

    const { result, act } = await renderHook(() => {
      const [awaited, setAwaited] = useState<number | undefined>(undefined)
      const open = () => {
        void TemplatePromise.start(str).then(setAwaited)
      }
      return { awaited, open }
    })

    expect(result.current.awaited).toBeUndefined()

    await act(async () => {
      result.current.open()
    })

    // the template is not rendered until `start()` is called
    const screen = await render(
      <TemplatePromise>
        {({ resolve, args }) => (
          <div>
            {args[0]}
            <button type="button" onClick={() => resolve(val)}>resolve</button>
          </div>
        )}
      </TemplatePromise>,
    )

    await vi.waitFor(() => {
      expect(screen.container.textContent).toContain(str)
    })

    await screen.getByRole('button', { name: 'resolve' }).click()

    await vi.waitFor(() => expect(result.current.awaited).toBe(val))
  })

  it('should reject', async () => {
    const TemplatePromise = createPromisifiedComponent<boolean>()

    const pending = TemplatePromise.start()
    pending.catch(() => {}) // avoid an unhandled rejection while awaiting the click

    const screen = await render(
      <TemplatePromise>
        {({ reject }) => (
          <button type="button" onClick={() => reject('cancelled')}>cancel</button>
        )}
      </TemplatePromise>,
    )

    await screen.getByRole('button', { name: 'cancel' }).click()

    await expect(pending).rejects.toBe('cancelled')
  })

  it('singleton mode returns the same promise', async () => {
    const TemplatePromise = createPromisifiedComponent<number>({ singleton: true })

    const p1 = TemplatePromise.start()
    const p2 = TemplatePromise.start()
    expect(p1).toBe(p2)

    const screen = await render(
      <TemplatePromise>
        {({ resolve }) => (
          <button type="button" onClick={() => resolve(7)}>ok</button>
        )}
      </TemplatePromise>,
    )

    await screen.getByRole('button', { name: 'ok' }).click()

    await expect(p1).resolves.toBe(7)
    await expect(p2).resolves.toBe(7)
  })

  it('renders one template per active promise and removes it once settled', async () => {
    const TemplatePromise = createPromisifiedComponent<string, [string]>()

    const screen = await render(
      <>
        <button type="button" onClick={() => { void TemplatePromise.start('A') }}>open A</button>
        <button type="button" onClick={() => { void TemplatePromise.start('B') }}>open B</button>
        <TemplatePromise>
          {({ resolve, args }) => (
            <div>
              <span>
                Dialog
                {' '}
                {args[0]}
              </span>
              <button type="button" onClick={() => resolve(args[0])}>
                resolve
                {' '}
                {args[0]}
              </button>
            </div>
          )}
        </TemplatePromise>
      </>,
    )

    expect(screen.container.textContent).not.toContain('Dialog')

    await screen.getByRole('button', { name: 'open A' }).click()
    await screen.getByRole('button', { name: 'open B' }).click()

    expect(screen.container.textContent).toContain('Dialog A')
    expect(screen.container.textContent).toContain('Dialog B')

    await screen.getByRole('button', { name: 'resolve B' }).click()

    await vi.waitFor(() => {
      expect(screen.container.textContent).not.toContain('Dialog B')
      expect(screen.container.textContent).toContain('Dialog A')
    })

    await screen.getByRole('button', { name: 'resolve A' }).click()

    await vi.waitFor(() => {
      expect(screen.container.textContent).not.toContain('Dialog')
    })
  })

  it('removes the rendered template on unmount', async () => {
    const TemplatePromise = createPromisifiedComponent<string>()

    const screen = await render(
      <>
        <button type="button" onClick={() => { void TemplatePromise.start() }}>open</button>
        <TemplatePromise>
          {() => <span>template content</span>}
        </TemplatePromise>
      </>,
    )

    expect(screen.container.querySelector('span')).toBeNull()

    await screen.getByRole('button', { name: 'open' }).click()

    expect(screen.container.querySelector('span')?.textContent).toBe('template content')

    await screen.unmount()

    expect(screen.container.querySelector('span')).toBeNull()
  })

  // Instances live in the factory closure (upstream: a module-level `deepRef`
  // list), so unmounting the component does not settle its pending promises —
  // they resolve once `resolve` is called, and re-mounting re-renders the
  // remaining instances.
  it('keeps the promise pending after unmount until it is resolved', async () => {
    const TemplatePromise = createPromisifiedComponent<boolean>()

    let resolveFn: ((v: boolean) => void) | undefined

    const screen = await render(
      <TemplatePromise>
        {({ resolve }) => {
          resolveFn = resolve
          return <span>template content</span>
        }}
      </TemplatePromise>,
    )

    const pending = TemplatePromise.start()

    await expect.element(screen.getByText('template content')).toBeVisible()

    await screen.unmount()

    resolveFn!(true)

    await expect(pending).resolves.toBe(true)
  })
})
