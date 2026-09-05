import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useToString } from './useToString'

function ToStringDemo() {
  return (
    <div>
      <span>{useToString(123.345)}</span>
      <span>{useToString('hi')}</span>
      <span>{useToString({ foo: 'hi' })}</span>
    </div>
  )
}

it('useToString converts values to string (component)', async () => {
  const screen = await render(<ToStringDemo />)

  await expect.element(screen.getByText('123.345')).toBeVisible()
  await expect.element(screen.getByText('hi')).toBeVisible()
  await expect.element(screen.getByText('[object Object]')).toBeVisible()
})

it('useToString converts values to string (renderHook)', async () => {
  const number = await renderHook(() => useToString(123.345))
  expect(number.result.current).toBe('123.345')

  const string = await renderHook(() => useToString('hi'))
  expect(string.result.current).toBe('hi')

  const object = await renderHook(() => useToString({ foo: 'hi' }))
  expect(object.result.current).toBe('[object Object]')
})
