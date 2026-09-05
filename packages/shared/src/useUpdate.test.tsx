import { useRef } from 'react'
import { expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useUpdate } from './useUpdate'

function UpdateDemo() {
  const update = useUpdate()
  const renders = useRef(0)
  renders.current += 1
  return (
    <div>
      <span>
        {'Render count: '}
        {renders.current}
      </span>
      <button onClick={() => update()}>Update</button>
    </div>
  )
}

it('useUpdate forces a re-render (component)', async () => {
  const screen = await render(<UpdateDemo />)

  await expect.element(screen.getByText('Render count: 1')).toBeVisible()

  await screen.getByRole('button', { name: 'Update' }).click()
  await expect.element(screen.getByText('Render count: 2')).toBeVisible()

  await screen.getByRole('button', { name: 'Update' }).click()
  await expect.element(screen.getByText('Render count: 3')).toBeVisible()
})

it('useUpdate returns a function that forces a re-render on each call', async () => {
  let renderCount = 0
  const { result, act } = await renderHook(() => {
    renderCount += 1
    return useUpdate()
  })

  const update = result.current
  const initialRenders = renderCount

  await act(() => update())
  expect(renderCount).toBe(initialRenders + 1)

  await act(() => update())
  expect(renderCount).toBe(initialRenders + 2)
})
