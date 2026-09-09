import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { configure } from 'vitest-browser-react/pure'
import { useAsyncQueue } from '../useAsyncQueue'

describe('useAsyncQueue', () => {
  const p1 = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(1000)
      }, 10)
    })
  }

  const p2 = (result: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(1000 + result)
      }, 20)
    })
  }

  const p3 = (result: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(1000 + result)
      }, 30)
    })
  }

  const pError = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('e'))
      }, 30)
    })
  }

  it('should return the tasks result', async () => {
    const { result } = await renderHook(() => useAsyncQueue([p1, p2, p3]))
    await vi.waitFor(() => {
      expect(result.current.activeIndex).toBe(2)
      expect(JSON.stringify(result.current.result)).toBe('[{"state":"fulfilled","data":1000},{"state":"fulfilled","data":2000},{"state":"fulfilled","data":3000}]')
    })
  })

  it('should passed the current task result to the next task', async () => {
    const { result } = await renderHook(() => useAsyncQueue([p1, p2]))
    await vi.waitFor(() => {
      expect(result.current.activeIndex).toBe(1)
      expect(result.current.result[result.current.activeIndex].data).toBe(2000)
    })
  })

  it('should trigger onFinished when the tasks ends', async () => {
    const onFinishedSpy = vi.fn()
    const { result } = await renderHook(() => useAsyncQueue([p1, p2], {
      onFinished: onFinishedSpy,
    }))
    await vi.waitFor(() => {
      expect(result.current.activeIndex).toBe(1)
      expect(onFinishedSpy).toHaveBeenCalled()
    })
  })

  it('should trigger onError when the tasks fails', async () => {
    const onErrorSpy = vi.fn()
    const { result } = await renderHook(() => useAsyncQueue([p3, pError], {
      onError: onErrorSpy,
    }))
    await vi.waitFor(() => {
      expect(result.current.activeIndex).toBe(1)
      expect(onErrorSpy).toHaveBeenCalledOnce()
    })
  })

  it('should interrupt the tasks when current task fails', async () => {
    const finalTaskSpy = vi.fn(() => Promise.resolve('data'))
    const onFinishedSpy = vi.fn()
    await renderHook(() => useAsyncQueue([p1, pError, finalTaskSpy], {
      onFinished: onFinishedSpy,
    }))

    await vi.waitFor(() => {
      expect(onFinishedSpy).toHaveBeenCalled()
      expect(finalTaskSpy).not.toHaveBeenCalled()
    })
  })

  it('should not interrupt the tasks when current task fails', async () => {
    const finalTaskSpy = vi.fn(() => Promise.resolve('data'))
    const onFinishedSpy = vi.fn()
    await renderHook(() => useAsyncQueue([p1, pError, finalTaskSpy], {
      interrupt: false,
      onFinished: onFinishedSpy,
    }))
    await vi.waitFor(() => {
      expect(onFinishedSpy).toHaveBeenCalled()
      expect(finalTaskSpy).toHaveBeenCalledOnce()
    })
  })

  it('should cancel the tasks', async () => {
    const controller = new AbortController()
    const { result } = await renderHook(() => useAsyncQueue([p1], {
      signal: controller.signal,
    }))
    controller.abort()
    await vi.waitFor(() => {
      expect(result.current.activeIndex).toBe(0)
      expect(result.current.result).toHaveLength(1)
      expect(result.current.result[result.current.activeIndex]).toMatchInlineSnapshot(`
        {
          "data": [Error: aborted],
          "state": "aborted",
        }
      `)
    })
  })

  it('should abort the tasks when AbortSignal.abort is triggered', async () => {
    const controller = new AbortController()
    const abort = () => controller.abort()
    const finalTaskSpy = vi.fn(() => Promise.resolve('data'))
    const { result } = await renderHook(() => useAsyncQueue([p1, abort, finalTaskSpy], {
      signal: controller.signal,
    }))
    await vi.waitFor(() => {
      expect(result.current.activeIndex).toBe(2)
      expect(result.current.result).toHaveLength(3)
      expect(finalTaskSpy).not.toHaveBeenCalled()
    })
  })

  it('should trigger onFinished when the last task is rejected', async () => {
    const onFinishedSpy = vi.fn()
    await renderHook(() => useAsyncQueue([p1, p2, pError], {
      onFinished: onFinishedSpy,
    }))
    await vi.waitFor(() => {
      expect(onFinishedSpy).toHaveBeenCalledOnce()
    })
  })

  it.each([null, undefined])('should handle %s tasks gracefully', async (tasks) => {
    const onFinishedSpy = vi.fn()
    const { result } = await renderHook(() =>
      useAsyncQueue(tasks as any, { onFinished: onFinishedSpy }),
    )

    await vi.waitFor(() => {
      expect(onFinishedSpy).toHaveBeenCalledOnce()
    })
    expect(result.current.activeIndex).toBe(-1)
    expect(result.current.result).toEqual([])
  })

  it('should run the queue exactly once under StrictMode', async () => {
    configure({ reactStrictMode: true })
    try {
      const taskSpy = vi.fn(() => Promise.resolve('data'))
      const onFinishedSpy = vi.fn()
      const { result } = await renderHook(() =>
        useAsyncQueue([taskSpy], { onFinished: onFinishedSpy }),
      )

      await vi.waitFor(() => {
        expect(result.current.activeIndex).toBe(0)
        expect(result.current.result[0]).toMatchObject({ state: 'fulfilled', data: 'data' })
      })
      expect(taskSpy).toHaveBeenCalledOnce()
      expect(onFinishedSpy).toHaveBeenCalledOnce()
    }
    finally {
      configure({ reactStrictMode: false })
    }
  })
})
