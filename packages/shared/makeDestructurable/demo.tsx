import { makeDestructurable } from '@reaxuse/shared'

const foo = { name: 'foo' }
const bar = 1024

const obj = makeDestructurable(
  { foo, bar } as const,
  [foo, bar] as const,
)

export default function MakeDestructurableDemo() {
  const { foo: fooObject, bar: barObject } = obj
  const [fooArray, barArray] = obj

  return (
    <div>
      <p>
        Object destructuring:
        {' '}
        <strong>{`${fooObject.name} / ${barObject}`}</strong>
      </p>
      <p>
        Array destructuring:
        {' '}
        <strong>{`${fooArray.name} / ${barArray}`}</strong>
      </p>
    </div>
  )
}
