import { useState } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useToString } from './useToString'

function ToStringDemo() {
  const str = useToString(123.345)
  return (
    <div>
      <span>{str}</span>
    </div>
  )
}

it('useToString converts a number to string (component)', async () => {
  const screen = await render(<ToStringDemo />)

  await expect.element(screen.getByText('123.345')).toBeVisible()
})

it('useToString converts numbers, booleans, objects and null', async () => {
  const number = await renderHook(() => useToString(123.345))
  expect(number.result.current).toBe('123.345')

  const boolean = await renderHook(() => useToString(true))
  expect(boolean.result.current).toBe('true')

  const object = await renderHook(() => useToString({ foo: 'hi' }))
  expect(object.result.current).toBe('[object Object]')

  const nil = await renderHook(() => useToString(null))
  expect(nil.result.current).toBe('null')
})

it('useToString supports a getter source', async () => {
  const { result } = await renderHook(() => useToString(() => 42))
  expect(result.current).toBe('42')
})

it('useToString reactively updates with state', async () => {
  const { result, act } = await renderHook(() => {
    const [number, setNumber] = useState(3.14)
    return { str: useToString(number), setNumber }
  })

  expect(result.current.str).toBe('3.14')

  await act(() => result.current.setNumber(2.5))
  expect(result.current.str).toBe('2.5')
})
