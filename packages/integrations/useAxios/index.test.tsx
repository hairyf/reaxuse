import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { noop } from '@reause/shared'
import axios, { AxiosError } from 'axios'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useAxios } from '../useAxios'

/**
 * Every test uses a custom `AxiosAdapter` — upstream's suite calls
 * `https://jsonplaceholder.typicode.com`, but these tests must never touch the
 * network, so the whole axios transport is replaced by a controllable fake.
 */
interface Todo {
  id: number
  title: string
}

const todo: Todo = { id: 1, title: 'delectus aut autem' }

function createResponse<T>(config: InternalAxiosRequestConfig, payload: T): AxiosResponse<T> {
  return {
    data: payload,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  }
}

/** Immediate adapter — resolves every request with `payload`. */
function createAdapter(payload: unknown = todo) {
  const requests: InternalAxiosRequestConfig[] = []
  const adapter: AxiosAdapter = async (config) => {
    requests.push(config)
    if (config.signal?.aborted)
      throw new AxiosError('canceled', AxiosError.ERR_CANCELED, config)
    return createResponse(config, payload)
  }
  return { adapter, requests }
}

/** Failing adapter — rejects every request with `reason`. */
function createFailingAdapter(reason: unknown = new AxiosError('boom')): AxiosAdapter {
  return async () => {
    throw reason
  }
}

interface PendingRequest {
  url: string | undefined
  config: InternalAxiosRequestConfig
  aborted: boolean
  settle: (payload: unknown) => void
  fail: (reason: unknown) => void
}

/**
 * Controllable adapter — requests stay pending until `settle`/`fail` is
 * called, so the in-flight `isLoading` state, the abort behaviour and late
 * responses can be observed deterministically. Aborting the request signal
 * rejects the pending request, like the real adapters do.
 */
function createDeferredAdapter() {
  const pending: PendingRequest[] = []

  const adapter: AxiosAdapter = config => new Promise<AxiosResponse>((resolve, reject) => {
    const entry: PendingRequest = {
      url: config.url,
      config,
      aborted: false,
      settle: (payload: unknown) => resolve(createResponse(config, payload)),
      fail: (reason: unknown) => reject(reason),
    }
    pending.push(entry)
    // `addEventListener` is optional on axios' `GenericAbortSignal`
    config.signal?.addEventListener?.('abort', () => {
      entry.aborted = true
      reject(new AxiosError('canceled', AxiosError.ERR_CANCELED, config))
    }, { once: true })
  })

  return { adapter, pending }
}

describe('useAxios', () => {
  it('should be defined', () => {
    expect(useAxios).toBeDefined()
  })

  it('params: url', async () => {
    const { adapter, requests } = createAdapter()
    const instance = axios.create({ adapter })
    const { result } = await renderHook(() => useAxios<Todo>('/todos/1', instance))

    await vi.waitFor(() => {
      expect(result.current.isFinished).toBe(true)
    })
    expect(requests).toHaveLength(1)
    expect(requests[0].url).toBe('/todos/1')
    expect(result.current.data).toEqual(todo)
    expect(result.current.response?.data).toEqual(todo)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAborted).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('params: url config instance', async () => {
    const { adapter, requests } = createAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', { method: 'GET', params: { a: 1 } }, instance, { immediate: false }))

    await act(async () => {
      await result.current.execute()
    })
    expect(requests[0].url).toBe('/todos/1')
    // axios normalizes the method to lower case
    expect(requests[0].method).toBe('get')
    expect(requests[0].params).toEqual({ a: 1 })
    expect(result.current.data).toEqual(todo)
  })

  it('params: url instance options', async () => {
    const { adapter, requests } = createAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false }))

    expect(requests).toHaveLength(0)
    expect(result.current.isLoading).toBe(false)

    await act(async () => {
      await result.current.execute()
    })
    expect(requests).toHaveLength(1)
    expect(result.current.isFinished).toBe(true)
  })

  it('params: url config instance options, execute: config', async () => {
    const { adapter, requests } = createAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/comments', { method: 'GET' }, instance, { immediate: false }))

    await act(async () => {
      await result.current.execute({ params: { postId: 1 } })
    })
    expect(requests[0].url).toBe('/comments')
    expect(requests[0].params).toEqual({ postId: 1 })

    await act(async () => {
      await result.current.execute({ params: { postId: 2 } })
    })
    expect(requests[1].params).toEqual({ postId: 2 })
  })

  it('params: url config (default instance)', async () => {
    const { adapter, requests } = createAdapter()
    const original = axios.defaults.adapter
    axios.defaults.adapter = adapter
    try {
      const { result } = await renderHook(() => useAxios<Todo>('/todos/1', { method: 'GET' }))

      await vi.waitFor(() => {
        expect(result.current.isFinished).toBe(true)
      })
      expect(requests).toHaveLength(1)
      expect(requests[0].url).toBe('/todos/1')
      // axios normalizes the method to lower case
      expect(requests[0].method).toBe('get')
      expect(result.current.data).toEqual(todo)
    }
    finally {
      axios.defaults.adapter = original
    }
  })

  it('params: url config options (default instance)', async () => {
    const { adapter, requests } = createAdapter()
    const original = axios.defaults.adapter
    axios.defaults.adapter = adapter
    try {
      const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', { method: 'GET' }, { immediate: false }))

      expect(requests).toHaveLength(0)
      await act(async () => {
        await result.current.execute()
      })
      expect(requests).toHaveLength(1)
      expect(result.current.data).toEqual(todo)
    }
    finally {
      axios.defaults.adapter = original
    }
  })

  it('params no url: no args, never fires on its own', async () => {
    // `useAxios()` — the url-less `EasyUseAxiosReturn` requires a url on
    // `execute`, so nothing runs until the caller supplies one (the missing-url
    // error path is covered by `sets ERR_INVALID_URL when no url is available`)
    const { result } = await renderHook(() => useAxios<Todo>())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFinished).toBe(false)
  })

  it('is loading on re-execute; a bare unawaited execute() never rejects', async () => {
    // upstream `should be loading on re-execute` — the returned shell is
    // dropped here on purpose: with the upstream `return promise` contract a
    // bare unawaited `execute()` never settles eagerly, so no unhandled
    // rejection can escape even when the request fails
    const onError = vi.fn()
    const { adapter, pending } = createDeferredAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false, onError }))

    await act(() => {
      void result.current.execute()
    })
    expect(result.current.isLoading).toBe(true)

    await act(() => {
      void result.current.execute('/todos/2')
    })
    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      pending[1].fail(new AxiosError('boom'))
    })
    expect(result.current.isLoading).toBe(false)
    // the aborted first request also reports its CanceledError through onError
    expect(onError).toHaveBeenCalledTimes(2)
  })

  it('supports the request-body generic (upstream `use generic type`)', async () => {
    interface ReqType { title: string, body: string, userId: number }
    interface ResType extends ReqType { id: number }
    const res: ResType = { id: 1, title: 'delectus aut autem', body: 'x', userId: 1 }
    const { adapter } = createAdapter(res)
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<ResType, ResType, ReqType>('/todos/1', { method: 'POST' }, instance, { immediate: false }))

    const requestData: ReqType = { title: 'title', body: 'body', userId: 123 }
    await act(async () => {
      await result.current.execute({ data: requestData })
    })
    expect(result.current.data).toEqual(res)
  })

  it('params no url: instance', async () => {
    const { adapter, requests } = createAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>(instance))

    expect(requests).toHaveLength(0)
    await act(async () => {
      await result.current.execute('/todos/1')
    })
    expect(requests[0].url).toBe('/todos/1')
    expect(result.current.data).toEqual(todo)
  })

  it('params no url: config instance', async () => {
    const { adapter, requests } = createAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>({ method: 'GET' }, instance))

    expect(requests).toHaveLength(0)
    await act(async () => {
      await result.current.execute('/todos/1')
    })
    expect(requests[0].url).toBe('/todos/1')
    expect(requests[0].method).toBe('get')
  })

  it('params no url: config only, never fires on its own', async () => {
    // the `(config)` form carries no url, so nothing runs immediately — the
    // default axios instance is never reached in this test
    const { result } = await renderHook(() => useAxios<Todo>({ method: 'GET' }))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFinished).toBe(false)
    expect(result.current.data).toBeUndefined()
  })

  it('should not crash when options is undefined', async () => {
    const { adapter, requests } = createAdapter()
    const instance = axios.create({ adapter })
    const { result } = await renderHook(() => useAxios<Todo>('/todos/1', instance, undefined))

    await vi.waitFor(() => {
      expect(result.current.isFinished).toBe(true)
    })
    expect(requests).toHaveLength(1)
  })

  it('transitions isLoading/isFinished around a request', async () => {
    const { adapter, pending } = createDeferredAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false }))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFinished).toBe(false)

    let request!: ReturnType<typeof result.current.execute>
    await act(async () => {
      request = result.current.execute()
    })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isFinished).toBe(false)

    await act(async () => {
      pending[0].settle(todo)
      await request
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFinished).toBe(true)
    expect(result.current.data).toEqual(todo)
  })

  it('execute resolves with the shell', async () => {
    const { adapter } = createAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false }))

    // upstream contract: `execute` returns the shared thenable — awaiting it
    // resolves with the full return shell, not the bare `AxiosResponse`
    let shell: Awaited<ReturnType<typeof result.current.execute>> | undefined
    await act(async () => {
      shell = await result.current.execute()
    })
    expect(shell?.data).toEqual(todo)
    expect(shell?.response?.status).toBe(200)
    expect(shell?.isFinished).toBe(true)
    expect(shell?.isLoading).toBe(false)
  })

  it('execute(url) replaces the hook url', async () => {
    const { adapter, requests } = createAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false }))

    await act(async () => {
      await result.current.execute('/todos/2')
    })
    expect(requests[0].url).toBe('/todos/2')
  })

  it('is thenable and resolves with the shell', async () => {
    const { adapter, pending } = createDeferredAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance))

    // the mount effect fired the request, so the shell is still pending
    expect(result.current.isLoading).toBe(true)
    const shellPromise = result.current.then()

    await act(async () => {
      pending[0].settle(todo)
    })
    const shell = await shellPromise
    expect(shell.data).toEqual(todo)
    expect(shell.response?.data).toEqual(todo)
    expect(shell.isFinished).toBe(true)
    expect(shell.isLoading).toBe(false)
    // the resolved shell keeps exposing fresh values (live getters)
    expect(result.current.data).toEqual(todo)
  })

  it('rejects `then` when the request fails', async () => {
    const error = new AxiosError('boom')
    const instance = axios.create({ adapter: createFailingAdapter(error) })
    const { result } = await renderHook(() => useAxios<Todo>('/todos/1', instance))

    await expect(result.current.then()).rejects.toBe(error)
    expect(result.current.error).toBe(error)
    expect(result.current.isFinished).toBe(true)
  })

  it('execute rejects and sets error when the request fails', async () => {
    const error = new AxiosError('boom')
    const instance = axios.create({ adapter: createFailingAdapter(error) })
    const onError = vi.fn()
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false, onError }))

    await act(async () => {
      await expect(result.current.execute()).rejects.toBe(error)
    })
    expect(result.current.error).toBe(error)
    expect(onError).toHaveBeenCalledWith(error)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFinished).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('should call onSuccess and onFinish on success', async () => {
    const { adapter } = createAdapter()
    const instance = axios.create({ adapter })
    const onSuccess = vi.fn()
    const onFinish = vi.fn()
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false, onSuccess, onFinish }))

    await act(async () => {
      await result.current.execute()
    })
    expect(onSuccess).toHaveBeenCalledWith(todo)
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('should use initialData', async () => {
    const initialData: Todo = { id: 0, title: 'initial' }
    const { adapter } = createAdapter()
    const instance = axios.create({ adapter })
    const { result } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false, initialData }))

    expect(result.current.data).toEqual(initialData)
  })

  it('should reset data when execute (resetOnExecute)', async () => {
    const initialData: Todo = { id: 0, title: 'initial' }
    const { adapter, pending } = createDeferredAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false, initialData, resetOnExecute: true }))

    let request!: ReturnType<typeof result.current.execute>
    await act(async () => {
      request = result.current.execute()
    })
    await act(async () => {
      pending[0].settle(todo)
      await request
    })
    expect(result.current.data).toEqual(todo)

    await act(async () => {
      request = result.current.execute()
    })
    // the reset happens synchronously at the start of the execution
    expect(result.current.data).toEqual(initialData)
    await act(async () => {
      pending[1].fail(new AxiosError('boom'))
      await request.catch(noop)
    })
    expect(result.current.data).toEqual(initialData)
  })

  it('should not reset data when execute (resetOnExecute default)', async () => {
    const initialData: Todo = { id: 0, title: 'initial' }
    const { adapter, pending } = createDeferredAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false, initialData }))

    let request!: ReturnType<typeof result.current.execute>
    await act(async () => {
      request = result.current.execute()
    })
    await act(async () => {
      pending[0].settle(todo)
      await request
    })
    expect(result.current.data).toEqual(todo)

    await act(async () => {
      request = result.current.execute()
    })
    expect(result.current.data).toEqual(todo)
    await act(async () => {
      pending[1].fail(new AxiosError('boom'))
      await request.catch(noop)
    })
    expect(result.current.data).toEqual(todo)
  })

  it('abort() marks isAborted/isCanceled and rejects the pending execute', async () => {
    const { adapter, pending } = createDeferredAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false }))

    let request!: ReturnType<typeof result.current.execute>
    await act(async () => {
      request = result.current.execute()
    })
    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      result.current.abort('aborted')
      await request.catch(noop)
    })
    expect(pending[0].aborted).toBe(true)
    expect(result.current.isAborted).toBe(true)
    expect(result.current.isCanceled).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFinished).toBe(true)
    expect(result.current.error).toBeDefined()
    expect(result.current.data).toBeUndefined()
  })

  it('abort() keeps initialData and is a no-op once finished', async () => {
    const initialData: Todo = { id: 0, title: 'initial' }
    const { adapter, pending } = createDeferredAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false, initialData }))

    let request!: ReturnType<typeof result.current.execute>
    await act(async () => {
      request = result.current.execute()
    })
    await act(async () => {
      result.current.abort()
      await request.catch(noop)
    })
    expect(result.current.data).toEqual(initialData)

    // already settled — abort must not flip anything back
    await act(async () => {
      result.current.abort()
    })
    expect(result.current.isAborted).toBe(true)
    expect(pending).toHaveLength(1)
  })

  it('does not apply a response that arrives after abort()', async () => {
    const { adapter, pending } = createDeferredAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false }))

    let request!: ReturnType<typeof result.current.execute>
    await act(async () => {
      request = result.current.execute()
    })
    await act(async () => {
      result.current.abort()
      await request.catch(noop)
    })
    expect(result.current.isAborted).toBe(true)

    // a response that shows up after the abort must not populate the state
    await act(async () => {
      pending[0].settle(todo)
    })
    expect(result.current.data).toBeUndefined()
    expect(result.current.response).toBeUndefined()
    expect(result.current.isAborted).toBe(true)
  })

  it('aborts the previous request when a new one is made (abortPrevious default)', async () => {
    const { adapter, pending } = createDeferredAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false }))

    await act(async () => {
      void result.current.execute()
    })
    expect(pending).toHaveLength(1)

    let second!: ReturnType<typeof result.current.execute>
    await act(async () => {
      second = result.current.execute('/todos/2')
    })
    expect(pending).toHaveLength(2)
    expect(pending[0].aborted).toBe(true)
    expect(pending[1].url).toBe('/todos/2')

    await act(async () => {
      pending[1].settle({ id: 2, title: 'second' })
      // upstream parity: the aborted first request leaves its CanceledError on
      // the live error, so the awaited shell of the (successful) re-execution
      // rejects with it — the state still reflects the new response
      await second.catch(noop)
    })
    expect(result.current.data).toEqual({ id: 2, title: 'second' })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFinished).toBe(true)
  })

  it('keeps the previous request alive when abortPrevious is false', async () => {
    const { adapter, pending } = createDeferredAdapter()
    const instance = axios.create({ adapter })
    const { result, act } = await renderHook(() => useAxios<Todo>('/todos/1', instance, { immediate: false, abortPrevious: false }))

    let first!: ReturnType<typeof result.current.execute>
    await act(async () => {
      first = result.current.execute()
    })
    let second!: ReturnType<typeof result.current.execute>
    await act(async () => {
      second = result.current.execute('/todos/2')
    })
    expect(pending).toHaveLength(2)
    expect(pending[0].aborted).toBe(false)

    await act(async () => {
      pending[0].fail(new AxiosError('boom'))
      pending[1].settle(todo)
      await Promise.all([first.catch(noop), second])
    })
    expect(result.current.data).toEqual(todo)
    expect(result.current.isFinished).toBe(true)
  })

  it('sets ERR_INVALID_URL when no url is available', async () => {
    // @ts-expect-error mock undefined url — upstream's `missing url` case
    const { result, act } = await renderHook(() => useAxios<Todo>(undefined, { method: 'GET' }, { immediate: false }))

    await act(async () => {
      // upstream constructs `new AxiosError(AxiosError.ERR_INVALID_URL)` — the
      // constant is the message, not the `code`
      await expect(result.current.execute()).rejects.toThrowError(AxiosError.ERR_INVALID_URL)
    })
    expect(result.current.error).toBeInstanceOf(AxiosError)
    expect(result.current.isFinished).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('types data as T with initialData and T | undefined without it', async () => {
    const withInitialData = await renderHook(() => useAxios<number>('/todos/1', { method: 'GET' }, { immediate: false, initialData: 1 }))
    expectTypeOf(withInitialData.result.current.data).toBeNumber()

    const withoutInitialData = await renderHook(() => useAxios<number>('/todos/1', { method: 'GET' }, { immediate: false }))
    expectTypeOf(withoutInitialData.result.current.data).toEqualTypeOf<number | undefined>()
  })
})
