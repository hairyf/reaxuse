import { useListener } from '@reaxuse/shared'
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useConfirmDialog } from '../useConfirmDialog'

describe('useConfirmDialog', () => {
  it('should be defined', () => {
    expect(useConfirmDialog).toBeDefined()
  })

  it('should open the dialog and close on confirm', async () => {
    const show = { current: false }

    const { result, act } = await renderHook(() => useConfirmDialog(show))

    await act(async () => {
      result.current.reveal()
    })
    expect(show.current).toBe(true)
    expect(result.current.isRevealed).toBe(true)

    await act(async () => {
      result.current.confirm()
    })
    expect(show.current).toBe(false)
    expect(result.current.isRevealed).toBe(false)
  })

  it('should close on cancel', async () => {
    const show = { current: false }

    const { result, act } = await renderHook(() => useConfirmDialog(show))

    await act(async () => {
      result.current.reveal()
    })
    expect(show.current).toBe(true)

    await act(async () => {
      result.current.cancel()
    })
    expect(show.current).toBe(false)
  })

  it('should execute `onReveal` fn on open dialog', async () => {
    const show = { current: false }
    const message = { current: 'initial' }

    const { result, act } = await renderHook(() => useConfirmDialog(show))
    expect(message.current).toBe('initial')

    result.current.onReveal(() => {
      message.current = 'final'
    })

    await act(async () => {
      result.current.reveal()
    })
    expect(message.current).toBe('final')

    await act(async () => {
      result.current.cancel()
    })
    expect(show.current).toBe(false)
  })

  it('should execute a callback inside `onConfirm` hook only after confirming', async () => {
    const show = { current: false }
    const message = { current: 'initial' }

    const { result, act } = await renderHook(() => useConfirmDialog(show))

    result.current.onConfirm(() => {
      message.current = 'final'
    })
    expect(message.current).toBe('initial')

    await act(async () => {
      result.current.reveal()
    })
    expect(message.current).toBe('initial')

    await act(async () => {
      result.current.confirm()
    })
    expect(message.current).toBe('final')
  })

  it('should execute a callback inside `onCancel` hook only after canceling dialog', async () => {
    const show = { current: false }
    const message = { current: 'initial' }

    const { result, act } = await renderHook(() => useConfirmDialog(show))

    result.current.onCancel(() => {
      message.current = 'final'
    })
    expect(message.current).toBe('initial')

    await act(async () => {
      result.current.reveal()
    })
    expect(message.current).toBe('initial')

    await act(async () => {
      result.current.cancel()
    })
    expect(message.current).toBe('final')
  })

  it('should pass data from confirm fn to `onConfirm` hook', async () => {
    const message = { current: 'initial' }
    const show = { current: false }
    const data = { value: 'confirm' }

    const { result, act } = await renderHook(() => useConfirmDialog(show))

    result.current.onConfirm((data) => {
      message.current = data.value
    })

    await act(async () => {
      result.current.reveal()
    })
    await act(async () => {
      result.current.confirm(data)
    })

    expect(message.current).toBe('confirm')
  })

  it('should pass data from cancel fn to `onCancel` hook', async () => {
    const message = { current: 'initial' }
    const show = { current: false }
    const data = { value: 'confirm' }

    const { result, act } = await renderHook(() => useConfirmDialog(show))

    result.current.onCancel((data) => {
      message.current = data.value
    })

    await act(async () => {
      result.current.reveal()
    })
    await act(async () => {
      result.current.cancel(data)
    })

    expect(message.current).toBe('confirm')
  })

  it('should return promise that will be resolved on `confirm()`', async () => {
    const show = { current: false }

    const { result, act } = await renderHook(() => useConfirmDialog(show))

    let promise!: ReturnType<typeof result.current.reveal>
    await act(async () => {
      promise = result.current.reveal()
    })
    expect(result.current.isRevealed).toBe(true)

    await act(async () => {
      result.current.confirm(true)
    })

    const { data, isCanceled } = await promise
    expect(data).toBe(true)
    expect(isCanceled).toBe(false)
  })

  it('should return promise that will be resolved on `cancel()`', async () => {
    const show = { current: false }

    const { result, act } = await renderHook(() => useConfirmDialog(show))

    let promise!: ReturnType<typeof result.current.reveal>
    await act(async () => {
      promise = result.current.reveal()
    })

    await act(async () => {
      result.current.cancel(true)
    })

    const { data, isCanceled } = await promise
    expect(data).toBe(true)
    expect(isCanceled).toBe(true)
  })

  it('returned `off` handle unsubscribes the listener', async () => {
    const calls = vi.fn()

    const { result, act } = await renderHook(() => useConfirmDialog())

    const { off } = result.current.onConfirm(() => {
      calls()
    })

    await act(async () => {
      result.current.reveal()
    })
    await act(async () => {
      result.current.confirm()
    })
    expect(calls).toHaveBeenCalledTimes(1)

    off()

    await act(async () => {
      result.current.reveal()
    })
    await act(async () => {
      result.current.confirm()
    })
    expect(calls).toHaveBeenCalledTimes(1)
  })

  it('useListener(onConfirm, cb) fires on confirm and stops after unmount', async () => {
    const calls = vi.fn()

    const { result, act, unmount } = await renderHook(() => {
      const dialog = useConfirmDialog()
      useListener(dialog.onConfirm, () => {
        calls()
      })
      return dialog
    })

    await act(async () => {
      result.current.reveal()
    })
    await act(async () => {
      result.current.confirm()
    })
    expect(calls).toHaveBeenCalledTimes(1)

    unmount()
    result.current.confirm()
    expect(calls).toHaveBeenCalledTimes(1)
  })

  it('useListener(onCancel, cb) fires on cancel and stops after unmount', async () => {
    const calls = vi.fn()

    const { result, act, unmount } = await renderHook(() => {
      const dialog = useConfirmDialog()
      useListener(dialog.onCancel, () => {
        calls()
      })
      return dialog
    })

    await act(async () => {
      result.current.reveal()
    })
    await act(async () => {
      result.current.cancel()
    })
    expect(calls).toHaveBeenCalledTimes(1)

    unmount()
    result.current.cancel()
    expect(calls).toHaveBeenCalledTimes(1)
  })
})
