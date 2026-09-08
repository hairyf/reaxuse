import type { UseCssSupportsReturn } from './useCssSupports'
import { useState } from 'react'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useCssSupports } from './useCssSupports'

// Mirrors upstream `source/vueuse/packages/core/useCssSupports/index.browser.test.ts`.
// Vue `shallowRef` + template bindings become React state; the ref-like
// inputs are additionally exercised with `renderHook` re-renders.

function BasicComponent() {
  const { isSupported: textDecoration } = useCssSupports(
    'text-decoration-style',
    'blink',
  )
  const { isSupported: transformOrigin } = useCssSupports(
    'transform-origin',
    '5%',
  )
  const { isSupported: flex } = useCssSupports('display: flex')
  const { isSupported: variable } = useCssSupports('(--foo: red)')
  const { isSupported: selectorHas } = useCssSupports('selector(:has(a))')
  const { isSupported: query } = useCssSupports(
    '(transform-style: preserve) or (-moz-transform-style: preserve) or (-webkit-transform-style: preserve)',
  )
  const { isSupported: doesNotExists } = useCssSupports('doesNotExist')

  return (
    <pre data-testid="data">
      {JSON.stringify({
        textDecoration,
        transformOrigin,
        flex,
        variable,
        selectorHas,
        query,
        doesNotExists,
      })}
    </pre>
  )
}

function ReactiveComponent() {
  const [condition, setCondition] = useState('display: flex')
  const { isSupported: conditionSupported } = useCssSupports(condition)

  const [prop, setProp] = useState('transform-origin')
  const [value, setValue] = useState('5%')
  const { isSupported: propValueSupported } = useCssSupports(prop, value)

  return (
    <>
      <pre data-testid="conditionResult">{String(conditionSupported)}</pre>
      <pre data-testid="propValueResult">{String(propValueSupported)}</pre>
      <button data-testid="setInvalidCondition" onClick={() => setCondition('e18e')}>invalid condition</button>
      <button data-testid="setInvalidValue" onClick={() => setValue('e18e')}>invalid value</button>
      <button data-testid="setValidValue" onClick={() => setValue('5%')}>valid value</button>
      <button data-testid="setInvalidProp" onClick={() => setProp('e18e')}>invalid prop</button>
    </>
  )
}

function ConditionTextComponent() {
  const { isSupported: noOptionsResult } = useCssSupports('display: flex')
  const { isSupported: withOptionsResult } = useCssSupports('display: flex', {})

  return (
    <>
      <pre data-testid="noOptions">{String(noOptionsResult)}</pre>
      <pre data-testid="withOptions">{String(withOptionsResult)}</pre>
    </>
  )
}

function PropValueOverloadComponent() {
  const { isSupported: conditionOnlyResult } = useCssSupports('display: flex')
  const { isSupported: withUndefinedResult } = useCssSupports('display: flex', undefined)
  const { isSupported: withRefUndefinedResult } = useCssSupports(
    'display: flex',
    // @ts-expect-error overload catches this issue correctly
    { current: undefined },
  )

  return (
    <>
      <pre data-testid="conditionOnly">{String(conditionOnlyResult)}</pre>
      <pre data-testid="withUndefined">{String(withUndefinedResult)}</pre>
      <pre data-testid="withRefUndefined">{String(withRefUndefinedResult)}</pre>
    </>
  )
}

describe('useCssSupports', () => {
  it('should be defined', () => {
    expect(useCssSupports).toBeDefined()
  })

  it('should correctly support existing features', async () => {
    const screen = await render(<BasicComponent />)
    const pre = screen.getByTestId('data')
    await expect.element(pre).toBeVisible()

    const results = JSON.parse(pre.query()!.textContent!)

    expect(results.textDecoration).toBe(false)
    expect(results.transformOrigin).toBe(true)
    expect(results.flex).toBe(true)
    expect(results.variable).toBe(true)
    expect(results.selectorHas).toBe(true)
    expect(results.query).toBe(false)
    expect(results.doesNotExists).toBe(false)
  })

  it('should reactively update if condition, prop or value changes', async () => {
    const screen = await render(<ReactiveComponent />)
    const conditionResult = screen.getByTestId('conditionResult')
    const propValueResult = screen.getByTestId('propValueResult')
    await expect.element(conditionResult).toBeVisible()
    await expect.element(propValueResult).toBeVisible()

    expect(conditionResult.query()!.textContent!.trim()).toBe('true')
    expect(propValueResult.query()!.textContent!.trim()).toBe('true')

    await screen.getByTestId('setInvalidCondition').click()
    expect(conditionResult.query()!.textContent!.trim()).toBe('false')

    await screen.getByTestId('setInvalidValue').click()
    expect(propValueResult.query()!.textContent!.trim()).toBe('false')

    await screen.getByTestId('setValidValue').click()
    expect(propValueResult.query()!.textContent!.trim()).toBe('true')

    await screen.getByTestId('setInvalidProp').click()
    expect(propValueResult.query()!.textContent!.trim()).toBe('false')
  })

  it('should not treat conditionText as prop when options is set and value is undefined', async () => {
    const screen = await render(<ConditionTextComponent />)
    const noOptions = screen.getByTestId('noOptions')
    const withOptions = screen.getByTestId('withOptions')
    await expect.element(noOptions).toBeVisible()
    await expect.element(withOptions).toBeVisible()

    expect(noOptions.query()!.textContent!.trim()).toBe('true')
    expect(withOptions.query()!.textContent!.trim()).toBe('true')
  })

  it('should use prop + value instead of condition if value is explicitly undefined', async () => {
    const screen = await render(<PropValueOverloadComponent />)
    const conditionOnly = screen.getByTestId('conditionOnly')
    const withUndefined = screen.getByTestId('withUndefined')
    const withRefUndefined = screen.getByTestId('withRefUndefined')
    await expect.element(conditionOnly).toBeVisible()
    await expect.element(withUndefined).toBeVisible()
    await expect.element(withRefUndefined).toBeVisible()

    expect(conditionOnly.query()!.textContent!.trim()).toBe('true')
    expect(withUndefined.query()!.textContent!.trim()).toBe('false')
    expect(withRefUndefined.query()!.textContent!.trim()).toBe('false')
  })

  it('should re-evaluate when a ref-like condition changes', async () => {
    const condition = { current: 'display: flex' }
    const { result, rerender } = await renderHook(
      (_props?: { force: number }) => useCssSupports(condition),
      { initialProps: { force: 0 } },
    )
    expect(result.current.isSupported).toBe(true)

    condition.current = 'e18e'
    await rerender({ force: 1 })
    expect(result.current.isSupported).toBe(false)
  })

  it('should re-evaluate when ref property / value change', async () => {
    const prop = { current: 'transform-origin' }
    const value = { current: '5%' }
    const { result, rerender } = await renderHook(
      (_props?: { force: number }) => useCssSupports(prop, value),
      { initialProps: { force: 0 } },
    )
    expect(result.current.isSupported).toBe(true)

    value.current = 'e18e'
    await rerender({ force: 1 })
    expect(result.current.isSupported).toBe(false)

    prop.current = 'display'
    value.current = 'flex'
    await rerender({ force: 2 })
    expect(result.current.isSupported).toBe(true)
  })

  it('should evaluate CSS.supports on a custom window', async () => {
    const supports = vi.fn(() => true)
    const fakeWindow = { CSS: { supports } } as unknown as Window
    const { result } = await renderHook(() =>
      useCssSupports('display', 'flex', { window: fakeWindow }),
    )
    expect(result.current.isSupported).toBe(true)
    expect(supports).toHaveBeenCalledWith('display', 'flex')
  })

  it('should stay at ssrValue when no window is available', async () => {
    const { result } = await renderHook(() =>
      useCssSupports('display: flex', { window: null as unknown as undefined, ssrValue: true }),
    )
    expect(result.current.isSupported).toBe(true)
  })

  it('types: returns an { isSupported } object mirroring the upstream Supportable', async () => {
    const { result } = await renderHook(() => useCssSupports('display: flex'))
    expectTypeOf(result.current).toEqualTypeOf<UseCssSupportsReturn>()
    expectTypeOf(result.current.isSupported).toEqualTypeOf<boolean>()
  })
})
