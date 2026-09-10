import type { ReactNode } from 'react'
import { objectOmit } from '@reaxuse/shared'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { createPortalSlot } from '../createPortalSlot'

describe('createPortalSlot', () => {
  it('should be defined', () => {
    expect(createPortalSlot).toBeDefined()
  })

  it('should work', async () => {
    const [PortalFoo, TargetFoo] = createPortalSlot()
    const [PortalBar, TargetBar] = createPortalSlot()
    const Zig = createPortalSlot()

    const screen = await render(
      <>
        <PortalFoo>{() => <>Foo</>}</PortalFoo>
        <TargetFoo />

        <PortalBar>{() => <>Bar</>}</PortalBar>
        <Zig.define>{() => <>Zig</>}</Zig.define>
        <TargetFoo />
        <TargetBar />
        <Zig.reuse />
      </>,
    )

    expect(screen.container.textContent).toBe('FooFooBarZig')
  })

  it('nested', async () => {
    function PassThrough({ children }: { children?: ReactNode }) {
      return <div>{children}</div>
    }

    const [PortalFoo, TargetFoo] = createPortalSlot()

    const screen = await render(
      <>
        <PortalFoo>{() => <>Foo</>}</PortalFoo>
        <PassThrough>
          <TargetFoo />
        </PassThrough>
      </>,
    )

    expect(screen.container.textContent).toBe('Foo')
  })

  it('props', async () => {
    const [PortalFoo, TargetFoo] = createPortalSlot<{ msg: string }>()

    const screen = await render(
      <>
        <PortalFoo>
          {args => <pre>{JSON.stringify(objectOmit(args, ['$slots']))}</pre>}
        </PortalFoo>
        <TargetFoo msg="Foo" />
        <TargetFoo msg="Bar" />
      </>,
    )

    expect(screen.container.textContent).toBe('{"msg":"Foo"}{"msg":"Bar"}')
  })

  // Upstream relies on Vue's attribute inheritance to land `id`/`class` on the
  // template's root element; React has no fallthrough attributes, so the
  // template applies the forwarded bindings itself.
  it('attrs', async () => {
    const [PortalFoo, TargetFoo] = createPortalSlot()

    const screen = await render(
      <>
        <PortalFoo>
          {({ id, className }) => <div id={id} className={`foo ${className}`} />}
        </PortalFoo>
        <TargetFoo id="bar" className="bar" />
      </>,
    )

    const el = screen.container.querySelector('#bar')
    expect(el).toBeDefined()
    expect(el!.classList.contains('foo')).toBe(true)
    expect(el!.classList.contains('bar')).toBe(true)
  })

  it('slots', async () => {
    const [PortalFoo, TargetFoo] = createPortalSlot<{ msg: string }, { default: undefined }>()

    const screen = await render(
      <>
        <PortalFoo>{({ $slots }) => $slots.default()}</PortalFoo>
        <TargetFoo msg="Goodbye"><div>Goodbye</div></TargetFoo>
        <TargetFoo msg="Hi"><div>Hi</div></TargetFoo>
      </>,
    )

    expect(screen.container.textContent).toBe('GoodbyeHi')
  })

  it('hyphen props', async () => {
    const [PortalFoo, TargetFoo] = createPortalSlot<{ myMsg: string }>()

    // React cannot type hyphenated props in JSX; forwarded keys are camelized
    // at runtime (`my-msg` → `myMsg`), mirroring upstream's attrs handling.
    const hyphenProps = { 'my-msg': 'Bar' } as Record<string, string>

    const screen = await render(
      <>
        <PortalFoo>
          {args => <pre>{JSON.stringify(objectOmit(args, ['$slots']))}</pre>}
        </PortalFoo>
        <TargetFoo myMsg="Foo" />
        <TargetFoo {...hyphenProps} />
      </>,
    )

    expect(screen.container.textContent).toBe('{"myMsg":"Foo"}{"myMsg":"Bar"}')
  })

  it('renders into the render target and cleans up on unmount', async () => {
    const [PortalFoo, TargetFoo] = createPortalSlot()

    const screen = await render(
      <>
        <PortalFoo>{() => <span>content</span>}</PortalFoo>
        <TargetFoo />
      </>,
    )

    expect(screen.container.querySelector('span')?.textContent).toBe('content')

    await screen.unmount()

    expect(screen.container.querySelector('span')).toBeNull()
  })
})
