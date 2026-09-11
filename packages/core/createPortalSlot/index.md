---
category: Component
---

# createPortalSlot

Define and reuse a template inside the component scope.

## Motivation

It's common to have the need to reuse some part of the UI. For example:

```tsx
function App({ showInDialog }: { showInDialog: boolean }) {
  return (
    <>
      {showInDialog
        ? <dialog>{/* something complex */}</dialog>
        : <div>{/* something complex */}</div>}
    </>
  )
}
```

We'd like to reuse our code as much as possible. So normally we might need to extract those duplicated parts into a component. However, in a separated component you lose the ability to access the local bindings. Defining props and events for them can be tedious sometimes.

So this function is made to provide a way for defining and reusing templates inside the component scope.

## Usage

In the previous example, we could refactor it to:

```tsx
import { createPortalSlot } from '@reause/core'

const [PortalSlot, SlotTarget] = createPortalSlot()

function App({ showInDialog }: { showInDialog: boolean }) {
  return (
    <>
      <PortalSlot>
        {() => {
          /* something complex */
        }}
      </PortalSlot>

      {showInDialog
        ? <dialog><SlotTarget /></dialog>
        : <div><SlotTarget /></div>}
    </>
  )
}
```

- `<PortalSlot>` will register the template — its children must be a render function — and renders nothing.
- `<SlotTarget>` will render the template provided by `<PortalSlot>`.
- `<PortalSlot>` must be used before `<SlotTarget>`.

> **Note**: It's recommended to extract as separate components whenever possible. Abusing this function might lead to bad practices for your codebase.

### Passing Data

You can also pass data to the template:

- Access the data in the render function passed to `<PortalSlot>`
- Directly bind the data as props on `<SlotTarget>` to pass them to the template

```tsx
import { createPortalSlot } from '@reause/core'

const [PortalSlot, SlotTarget] = createPortalSlot()

function App({ data, anotherData }: { data: string, anotherData: string }) {
  return (
    <>
      <PortalSlot>
        {({ data, msg }) => <div>{`${data} passed from usage`}</div>}
      </PortalSlot>

      <SlotTarget data={data} msg="The first usage" />
      <SlotTarget data={anotherData} msg="The second usage" />
      <SlotTarget {...{ data: 'something', msg: 'The third' }} />
    </>
  )
}
```

### TypeScript Support

`createPortalSlot` accepts a generic type to provide type support for the data passed to the template:

```tsx
import { createPortalSlot } from '@reause/core'

// Comes with a pair of `PortalSlot` and `SlotTarget`
const [PortalFoo, TargetFoo] = createPortalSlot<{ msg: string }>()

// You can create multiple portal slots
const [PortalBar, TargetBar] = createPortalSlot<{ items: string[] }>()

function App() {
  return (
    <>
      <PortalFoo>
        {/* `msg` is typed as `string` */}
        {({ msg }) => <div>{`Hello ${msg.toUpperCase()}`}</div>}
      </PortalFoo>

      <TargetFoo msg="World" />
    </>
  )
}
```

Optionally, if you are not a fan of array destructuring, the following usages are also legal:

```tsx
import { createPortalSlot } from '@reause/core'

const { define: PortalFoo, reuse: TargetFoo } = createPortalSlot<{
  msg: string
}>()

function App() {
  return (
    <>
      <PortalFoo>
        {({ msg }) => <div>{`Hello ${msg.toUpperCase()}`}</div>}
      </PortalFoo>

      <TargetFoo msg="World" />
    </>
  )
}
```

```tsx
import { createPortalSlot } from '@reause/core'

const TemplateFoo = createPortalSlot<{ msg: string }>()

function App() {
  return (
    <>
      <TemplateFoo.define>
        {({ msg }) => <div>{`Hello ${msg.toUpperCase()}`}</div>}
      </TemplateFoo.define>

      <TemplateFoo.reuse msg="World" />
    </>
  )
}
```

### Props

By default, all props passed to `<SlotTarget>` are forwarded to the template. If you don't want certain props to be forwarded, list them in the `props` option. React has no runtime props declaration (upstream uses Vue's `ComponentObjectPropsOptions`), so this is a list of prop keys instead:

```tsx
import { createPortalSlot } from '@reause/core'

const [PortalSlot, SlotTarget] = createPortalSlot<{ msg: string, enable: boolean }>({
  props: ['msg', 'enable'],
})
```

The `inheritAttrs` option is accepted for API parity with upstream, but it has no runtime effect: React has no attribute-inheritance system, so props never fall through to a root element.

### Passing Slots

It's also possible to pass children back from `<SlotTarget>`. You can access them on `<PortalSlot>` from `$slots.default`:

```tsx
import { createPortalSlot } from '@reause/core'

const [PortalSlot, SlotTarget] = createPortalSlot()

function App() {
  return (
    <>
      <PortalSlot>
        {({ $slots }) => (
          <div>
            {/* To render the children */}
            {$slots.default()}
          </div>
        )}
      </PortalSlot>

      <SlotTarget>
        <div>Some content</div>
      </SlotTarget>
      <SlotTarget>
        <div>Another content</div>
      </SlotTarget>
    </>
  )
}
```

### React divergences from upstream

- **children-as-function replaces `v-slot`.** The template is a render function passed as the children of `<PortalSlot>`; it receives the bindings object (the props passed to `<SlotTarget>`) plus `$slots`.
- **Single slot.** React components expose only the `default` slot: `$slots.default` is a function returning the children passed to `<SlotTarget>` (upstream exposes an arbitrary `$slots` map).
- **No attribute inheritance.** React has no attrs/props split, so every prop except `children` is forwarded to the template as a binding — camelized (`my-msg` → `myMsg`) when no `props` option is given, mirroring upstream's attrs path. `inheritAttrs` is therefore a no-op.
- **Capture during render.** The template is captured when `<PortalSlot>` renders (like upstream's define render assigns the slot), so `<PortalSlot>` must render before `<SlotTarget>` in the same commit.
- **`props` option shape.** A list of prop keys instead of Vue's runtime props definition.
