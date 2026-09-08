import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { makeDestructurable } from './makeDestructurable'

// Upstream (@vueuse/shared) ships no tests for makeDestructurable, so the key
// behaviors are covered here directly: object destructuring, array
// destructuring (via a non-enumerable Symbol.iterator) and iteration.

describe('makeDestructurable', () => {
  const foo = { name: 'foo' }
  const bar = 1024

  it('supports object destructuring', () => {
    const obj = makeDestructurable({ foo, bar } as const, [foo, bar] as const)

    const { foo: foo1, bar: bar1 } = obj

    expect(foo1).toBe(foo)
    expect(bar1).toBe(bar)
  })

  it('supports array destructuring', () => {
    const obj = makeDestructurable({ foo, bar } as const, [foo, bar] as const)

    const [foo2, bar2] = obj

    expect(foo2).toBe(foo)
    expect(bar2).toBe(bar)
  })

  it('keeps object keys enumerable and arrays reachable through the iterator', () => {
    const obj = makeDestructurable({ foo, bar } as const, [foo, bar] as const)

    // the iterator itself is a non-enumerable property, so object keys are
    // untouched
    expect(Object.keys(obj)).toEqual(['foo', 'bar'])
    // while array destructuring yields the array elements
    expect([...obj]).toEqual([foo, bar])

    const iterator = obj[Symbol.iterator]()
    expect(iterator.next()).toEqual({ value: foo, done: false })
    expect(iterator.next()).toEqual({ value: bar, done: false })
    expect(iterator.next()).toEqual({ value: undefined, done: true })
  })

  it('exposes the object properties alongside array iteration', () => {
    const obj = makeDestructurable({ foo, bar } as const, [foo, bar] as const)

    expect(obj.foo).toBe(foo)
    expect(obj.bar).toBe(bar)

    // both destructuring modes yield the same values
    const { foo: byKey } = obj
    const [byIndex] = obj

    expect(byKey).toBe(byIndex)
  })
})

describe('makeDestructurable (component)', () => {
  function MakeDestructurableDemo() {
    const [obj] = useState(() => makeDestructurable(
      { count: 1, label: 'hi' } as const,
      [1, 'hi'] as const,
    ))

    const { count, label } = obj
    const [count2, label2] = obj

    return (
      <div>
        <p>
          object:
          {' '}
          {`${count}-${label}`}
        </p>
        <p>
          array:
          {' '}
          {`${count2}-${label2}`}
        </p>
      </div>
    )
  }

  it('destructures the same value both ways inside a component', async () => {
    const screen = await render(<MakeDestructurableDemo />)

    await expect.element(screen.getByText('object: 1-hi')).toBeVisible()
    await expect.element(screen.getByText('array: 1-hi')).toBeVisible()
  })
})
