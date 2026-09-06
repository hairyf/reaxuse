import type { AfterFetchContext, OnFetchErrorContext } from './useFetch'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { createFetch, useFetch } from './useFetch'

const jsonMessage = { hello: 'world' }
const baseUrl = 'https://example.com'
const jsonUrl = `${baseUrl}?json=${encodeURI(JSON.stringify(jsonMessage))}`

const mockDelay = 10

// `new Response(body, { status })` does not auto-fill `statusText` in
// Chromium, so mirror the default reason phrase (as MSW's HttpResponse does).
const statusTextMap: Record<number, string> = {
  200: 'OK',
  301: 'Moved Permanently',
  400: 'Bad Request',
  404: 'Not Found',
  500: 'Internal Server Error',
}

function withStatus(status: number, init?: ResponseInit): ResponseInit {
  return { ...init, status, statusText: init?.statusText ?? statusTextMap[status] ?? '' }
}

// in-browser mock of the upstream MSW mock server
// (source/vueuse/packages/.test/mockServer.ts) — `?text`, `?json`, `?status`
// and `?delay` query params drive the response. A short default delay keeps
// the request in-flight long enough for event subscriptions and state reads
// to happen (the request fires from a mount effect in React). The signal is
// honored like a real fetch: an abort rejects the in-flight request with the
// abort reason.
async function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = new URL(typeof input === 'string' ? input : input.toString())
  const qs = url.searchParams

  let status = 200
  if (qs.get('status'))
    status = Number(qs.get('status'))

  const delay = qs.get('delay') ? Number(qs.get('delay')) : mockDelay

  const signal = init?.signal
  if (signal) {
    if (signal.aborted)
      throw signal.reason ?? new DOMException('The operation was aborted.', 'AbortError')
    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        signal.removeEventListener('abort', onAbort)
        reject(signal.reason ?? new DOMException('The operation was aborted.', 'AbortError'))
      }
      signal.addEventListener('abort', onAbort, { once: true })
      setTimeout(() => {
        signal.removeEventListener('abort', onAbort)
        resolve()
      }, delay)
    })
  }
  else {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  if (signal?.aborted)
    throw signal.reason ?? new DOMException('The operation was aborted.', 'AbortError')

  if (init?.method === 'POST') {
    const rawBody = init.body
    const text = typeof rawBody === 'string'
      ? rawBody
      : rawBody
        ? JSON.stringify(rawBody)
        : ''
    const json = (text.startsWith('{') || text.startsWith('[')) ? JSON.parse(text) : null

    // Echo back the request payload
    if (json)
      return new Response(JSON.stringify(json), withStatus(status, { headers: { 'Content-Type': 'application/json' } }))
    else if (text)
      return new Response(text, withStatus(status))
    // fall through to the common transformers
  }

  if (qs.get('text') != null) {
    return new Response(qs.get('text') ?? 'Hello World', withStatus(status))
  }
  else if (qs.get('json') != null) {
    const jsonVal = qs.get('json')
    return new Response(JSON.stringify(jsonVal?.length ? JSON.parse(jsonVal) : jsonMessage), withStatus(status, { headers: { 'Content-Type': 'application/json' } }))
  }

  return new Response(JSON.stringify(jsonMessage), withStatus(status, { headers: { 'Content-Type': 'application/json' } }))
}

let fetchSpy = vi.fn(mockFetch)

function fetchSpyHeaders(idx = 0) {
  return (fetchSpy.mock.calls[idx][1] as any).headers
}

function createFetchWithBaseUrl(options: Parameters<typeof createFetch>[0] = {}) {
  return createFetch({
    baseUrl,
    ...options,
  })
}

function nextTick() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0)
  })
}

describe('useFetch', () => {
  beforeEach(() => {
    fetchSpy = vi.fn(mockFetch)
    vi.stubGlobal('fetch', fetchSpy)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should have status code of 200 and message of Hello World', async () => {
    const { result } = await renderHook(() => useFetch(`${baseUrl}?text=hello`))
    await vi.waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(result.current.data).toBe('hello')
      expect(result.current.statusCode).toBe(200)
    })
  })

  it('should be able to use the Headers object', async () => {
    const myHeaders = new Headers()
    myHeaders.append('Authorization', 'test')

    await renderHook(() => useFetch(baseUrl, { headers: myHeaders }))

    await vi.waitFor(() => {
      expect(fetchSpyHeaders()).toEqual({ authorization: 'test' })
    })
  })

  it('should parse response as json', async () => {
    const { result } = await renderHook(() => useFetch(jsonUrl).json())
    await vi.waitFor(() => {
      expect(result.current.data).toEqual(jsonMessage)
    })
  })

  it('should use custom fetch', async () => {
    let count = 0
    await renderHook(() => useFetch(baseUrl, {
      fetch: ((input, init) => {
        count = 1
        return window.fetch(input as string, init)
      }) as typeof window.fetch,
    }))

    await vi.waitFor(() => {
      expect(count).toEqual(1)
    })
  })

  it('should use custom payloadType', async () => {
    let captured: any
    await renderHook(() => useFetch(baseUrl, {
      beforeFetch: (ctx) => {
        captured = ctx.options
      },
    }).post({ x: 1 }, 'unknown'))

    await vi.waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(captured.body).toEqual({ x: 1 })
      expect(captured.headers['Content-Type']).toBe('unknown')
    })
  })

  it('should use \'json\' payloadType', async () => {
    let captured: any
    const payload = [1, 2]
    await renderHook(() => useFetch(baseUrl, {
      beforeFetch: (ctx) => {
        captured = ctx.options
      },
    }).post(payload))

    await vi.waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(captured.body).toEqual(JSON.stringify(payload))
      expect(captured.headers['Content-Type']).toBe('application/json')
    })
  })

  it('should have an error on 400', async () => {
    const { result } = await renderHook(() => useFetch(`${baseUrl}?status=400`))

    await vi.waitFor(() => {
      expect(result.current.statusCode).toBe(400)
      expect(result.current.error).toBe('Bad Request')
    })
  })

  it('should throw error', async () => {
    const { result: result400 } = await renderHook(() => useFetch(`${baseUrl}?status=400`, { immediate: false }))
    const { result: result500 } = await renderHook(() => useFetch(`${baseUrl}?status=500`, { immediate: false }))

    const error1 = await result400.current.execute(true).catch(err => err)
    const error2 = await result500.current.execute(true).catch(err => err)

    expect(error1.name).toBe('Error')
    expect(error1.message).toBe('Bad Request')
    expect(error2.name).toBe('Error')
    expect(error2.message).toBe('Internal Server Error')
  })

  it('should abort request and set aborted to true', async () => {
    const { result } = await renderHook(() => useFetch(baseUrl))
    setTimeout(() => result.current.abort(), 0)
    await vi.waitFor(() => {
      expect(result.current.aborted).toBe(true)
    })
    await result.current.execute()
    result.current.abort()
    await vi.waitFor(() => {
      expect(result.current.aborted).toBe(true)
    })
  })

  it('should not call if immediate is false', async () => {
    await renderHook(() => useFetch(baseUrl, { immediate: false }))
    await vi.waitFor(() => {
      expect(fetchSpy).toBeCalledTimes(0)
    })
  })

  it('should refetch if refetch is set to true', async () => {
    const url = { current: baseUrl }
    await renderHook(() => useFetch(url, { refetch: true }))
    url.current = `${baseUrl}?text`
    await vi.waitFor(() => {
      expect(fetchSpy).toBeCalledTimes(2)
    })
  })

  it('should auto refetch when the refetch is set to true and the payload is a ref', async () => {
    const param = { current: { num: 1 } }
    await renderHook(() => useFetch(baseUrl, { refetch: true }).post(param))
    param.current.num = 2
    await vi.waitFor(() => {
      expect(fetchSpy).toBeCalledTimes(2)
    })
  })

  it('should create an instance of useFetch with baseUrls', async () => {
    const targetUrl = `${baseUrl}/test`
    const fetchHeaders = { Authorization: 'test' }
    const requestHeaders = { 'Accept-Language': 'en-US' }
    const allHeaders = { ...fetchHeaders, ...requestHeaders }
    const requestOptions = { headers: requestHeaders }
    const useMyFetchWithBaseUrl = createFetchWithBaseUrl({ fetchOptions: { headers: fetchHeaders } })
    const useMyFetchWithoutBaseUrl = createFetchWithBaseUrl({ fetchOptions: { headers: fetchHeaders } })

    await renderHook(() => {
      useMyFetchWithBaseUrl('test', requestOptions)
      useMyFetchWithBaseUrl('/test', requestOptions)
      useMyFetchWithBaseUrl(targetUrl, requestOptions)
      useMyFetchWithoutBaseUrl(targetUrl, requestOptions)
    })

    await vi.waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(4)
      Array.from({ length: 4 }).fill(0).forEach((x, i) => {
        expect(fetchSpy).toHaveBeenNthCalledWith(i + 1, `${baseUrl}/test`, expect.anything())
      })
      expect(fetchSpyHeaders()).toMatchObject(allHeaders)
    })
  })

  it('should chain beforeFetch function when using a factory instance', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      options: {
        beforeFetch({ options }) {
          options.headers = { ...options.headers, Global: 'foo' }
          return { options }
        },
      },
    })
    await renderHook(() => useMyFetch('test', {
      beforeFetch({ options }) {
        options.headers = { ...options.headers, Local: 'foo' }
        return { options }
      },
    }))

    await vi.waitFor(() => {
      expect(fetchSpyHeaders()).toMatchObject({ Global: 'foo', Local: 'foo' })
    })
  })

  it('should chain afterFetch function when using a factory instance', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      options: {
        afterFetch(ctx) {
          ctx.data.title = 'Global'
          return ctx
        },
      },
    })
    const { result } = await renderHook(() => useMyFetch('test?json', {
      afterFetch(ctx) {
        ctx.data.title += ' Local'
        return ctx
      },
    }).json())

    await vi.waitFor(() => {
      expect(result.current.data).toEqual(expect.objectContaining({ title: 'Global Local' }))
    })
  })

  it('should chain onFetchError function when using a factory instance', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      options: {
        onFetchError(ctx) {
          ctx.error = 'Global'
          return ctx
        },
      },
    })
    const { result } = await renderHook(() => useMyFetch('test?status=400&json', {
      onFetchError(ctx) {
        ctx.error += ' Local'
        return ctx
      },
    }).json())

    await vi.waitFor(() => {
      expect(result.current.error).toEqual('Global Local')
    })
  })

  it('should chain beforeFetch function when using a factory instance and the options object in useMyFetch', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      options: {
        beforeFetch({ options }) {
          options.headers = { ...options.headers, Global: 'foo' }
          return { options }
        },
      },
    })
    await renderHook(() => useMyFetch(
      'test',
      { method: 'GET' },
      {
        beforeFetch({ options }) {
          options.headers = { ...options.headers, Local: 'foo' }
          return { options }
        },
      },
    ))

    await vi.waitFor(() => {
      expect(fetchSpyHeaders()).toMatchObject({ Global: 'foo', Local: 'foo' })
    })
  })

  it('should chain afterFetch function when using a factory instance and the options object in useMyFetch', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      options: {
        afterFetch(ctx) {
          ctx.data.title = 'Global'
          return ctx
        },
      },
    })
    const { result } = await renderHook(() => useMyFetch(
      'test?json',
      { method: 'GET' },
      {
        afterFetch(ctx) {
          ctx.data.title += ' Local'
          return ctx
        },
      },
    ).json())

    await vi.waitFor(() => {
      expect(result.current.data).toEqual(expect.objectContaining({ title: 'Global Local' }))
    })
  })

  it('should chain onFetchError function when using a factory instance and the options object in useMyFetch', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      options: {
        onFetchError(ctx) {
          ctx.error = 'Global'
          return ctx
        },
      },
    })
    const { result } = await renderHook(() => useMyFetch(
      'test?status=400&json',
      { method: 'GET' },
      {
        onFetchError(ctx) {
          ctx.error += ' Local'
          return ctx
        },
      },
    ).json())

    await vi.waitFor(() => {
      expect(result.current.error).toEqual('Global Local')
    })
  })

  it('should overwrite beforeFetch function when using a factory instance', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      combination: 'overwrite',
      options: {
        beforeFetch({ options }) {
          options.headers = { ...options.headers, Global: 'foo' }
          return { options }
        },
      },
    })
    await renderHook(() => useMyFetch('test', {
      beforeFetch({ options }) {
        options.headers = { ...options.headers, Local: 'foo' }
        return { options }
      },
    }))

    await vi.waitFor(() => {
      expect(fetchSpyHeaders()).toMatchObject({ Local: 'foo' })
    })
  })

  it('should overwrite afterFetch function when using a factory instance', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      combination: 'overwrite',
      options: {
        afterFetch(ctx) {
          ctx.data.global = 'Global'
          return ctx
        },
      },
    })
    const { result } = await renderHook(() => useMyFetch('test?json', {
      afterFetch(ctx) {
        ctx.data.local = 'Local'
        return ctx
      },
    }).json())

    await vi.waitFor(() => {
      expect(result.current.data).toEqual(expect.objectContaining({ local: 'Local' }))
      expect(result.current.data).toEqual(expect.not.objectContaining({ global: 'Global' }))
    })
  })

  it('should overwrite onFetchError function when using a factory instance', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      combination: 'overwrite',
      options: {
        onFetchError(ctx) {
          ctx.error = 'Global'
          return ctx
        },
      },
    })
    const { result } = await renderHook(() => useMyFetch('test?status=400&json', {
      onFetchError(ctx) {
        ctx.error = 'Local'
        return ctx
      },
    }).json())

    await vi.waitFor(() => {
      expect(result.current.error).toEqual('Local')
    })
  })

  it('should overwrite beforeFetch function when using a factory instance and the options object in useMyFetch', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      combination: 'overwrite',
      options: {
        beforeFetch({ options }) {
          options.headers = { ...options.headers, Global: 'foo' }
          return { options }
        },
      },
    })
    await renderHook(() => useMyFetch(
      'test',
      { method: 'GET' },
      {
        beforeFetch({ options }) {
          options.headers = { ...options.headers, Local: 'foo' }
          return { options }
        },
      },
    ))

    await vi.waitFor(() => {
      expect(fetchSpyHeaders()).toMatchObject({ Local: 'foo' })
    })
  })

  it('should overwrite afterFetch function when using a factory instance and the options object in useMyFetch', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      combination: 'overwrite',
      options: {
        afterFetch(ctx) {
          ctx.data.global = 'Global'
          return ctx
        },
      },
    })
    const { result } = await renderHook(() => useMyFetch(
      'test?json',
      { method: 'GET' },
      {
        afterFetch(ctx) {
          ctx.data.local = 'Local'
          return ctx
        },
      },
    ).json())

    await vi.waitFor(() => {
      expect(result.current.data).toEqual(expect.objectContaining({ local: 'Local' }))
      expect(result.current.data).toEqual(expect.not.objectContaining({ global: 'Global' }))
    })
  })

  it('should overwrite onFetchError function when using a factory instance and the options object in useMyFetch', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      combination: 'overwrite',
      options: {
        onFetchError(ctx) {
          ctx.error = 'Global'
          return ctx
        },
      },
    })
    const { result } = await renderHook(() => useMyFetch(
      'test?status=400&json',
      { method: 'GET' },
      {
        onFetchError(ctx) {
          ctx.error = 'Local'
          return ctx
        },
      },
    ).json())

    await vi.waitFor(() => {
      expect(result.current.error).toEqual('Local')
    })
  })

  it('should run the beforeFetch function and add headers to the request', async () => {
    await renderHook(() => useFetch(baseUrl, { headers: { 'Accept-Language': 'en-US' } }, {
      beforeFetch({ options }) {
        options.headers = {
          ...options.headers,
          Authorization: 'my-auth-token',
        }

        return { options }
      },
    }))

    await vi.waitFor(() => {
      expect(fetchSpyHeaders()).toMatchObject({ 'Authorization': 'my-auth-token', 'Accept-Language': 'en-US' })
    })
  })

  it('should run the beforeFetch has default headers', async () => {
    await renderHook(() => useFetch(baseUrl, {
      beforeFetch({ options }) {
        expect(options.headers).toBeDefined()
        return { options }
      },
    }))
  })

  it('should run the beforeFetch function and cancel the request', async () => {
    const { result } = await renderHook(() => useFetch(baseUrl, {
      immediate: false,
      beforeFetch({ cancel }) {
        cancel()
      },
    }))

    await result.current.execute()
    expect(fetchSpy).toBeCalledTimes(0)
  })

  it('should run the afterFetch function', async () => {
    const { result } = await renderHook(() => useFetch(jsonUrl, {
      afterFetch(ctx) {
        ctx.data.title = 'Hunter x Hunter'
        return ctx
      },
    }).json())

    await vi.waitFor(() => {
      expect(result.current.data).toEqual(expect.objectContaining({ title: 'Hunter x Hunter' }))
    })
  })

  it('async chained beforeFetch and afterFetch should be executed in order', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      options: {
        async beforeFetch({ options }) {
          await nextTick()
          options.headers = { ...options.headers, title: 'Hunter X Hunter' }
          return { options }
        },
        async afterFetch(ctx) {
          await nextTick()
          ctx.data.message = 'Hunter X Hunter'
          return ctx
        },
      },
    })

    const { result } = await renderHook(() => useMyFetch(
      'test?json',
      { method: 'GET' },
      {
        async beforeFetch({ options }) {
          await Promise.resolve()
          options.headers = { ...options.headers, title: 'Hello, VueUse' }
          return { options }
        },
        async afterFetch(ctx) {
          await Promise.resolve()
          ctx.data.message = 'Hello, VueUse'
          return ctx
        },
      },
    ).json())

    await vi.waitFor(() => {
      expect(fetchSpyHeaders()).toMatchObject({ title: 'Hello, VueUse' })
      expect(result.current.data).toEqual(expect.objectContaining({ message: 'Hello, VueUse' }))
    })
  })

  it('should run the onFetchError function', async () => {
    const { result } = await renderHook(() => useFetch(`${baseUrl}?status=400&json`, {
      onFetchError(ctx) {
        ctx.error = 'Internal Server Error'
        ctx.data = 'Internal Server Error'
        return ctx
      },
    }).json())

    await vi.waitFor(() => {
      expect(result.current.statusCode).toEqual(400)
      expect(result.current.error).toEqual('Internal Server Error')
      expect(result.current.data).toBeNull()
    })
  })

  it('should return data in onFetchError when updateDataOnError is true', async () => {
    const { result } = await renderHook(() => useFetch(`${baseUrl}?status=400&json`, {
      updateDataOnError: true,
      onFetchError(ctx) {
        ctx.error = 'Internal Server Error'
        ctx.data = 'Internal Server Error'
        return ctx
      },
    }).json())

    await vi.waitFor(() => {
      expect(result.current.statusCode).toEqual(400)
      expect(result.current.error).toEqual('Internal Server Error')
      expect(result.current.data).toEqual('Internal Server Error')
    })
  })

  it('should run the onFetchError function when network error', async () => {
    const { result } = await renderHook(() => useFetch(`${baseUrl}?status=500&text=Internal%20Server%20Error`, {
      onFetchError(ctx) {
        ctx.error = 'Internal Server Error'

        return ctx
      },
    }).json())

    await vi.waitFor(() => {
      expect(result.current.statusCode).toStrictEqual(500)
      expect(result.current.error).toEqual('Internal Server Error')
      expect(result.current.data).toBeNull()
    })
  })

  it('should emit onFetchResponse event', async () => {
    const onFetchErrorSpy = vi.fn()
    const onFetchResponseSpy = vi.fn()
    const onFetchFinallySpy = vi.fn()
    const { result } = await renderHook(() => useFetch(baseUrl))

    result.current.onFetchResponse(onFetchResponseSpy)
    result.current.onFetchError(onFetchErrorSpy)
    result.current.onFetchFinally(onFetchFinallySpy)

    await vi.waitFor(() => {
      expect(onFetchErrorSpy).not.toHaveBeenCalled()
      expect(onFetchResponseSpy).toHaveBeenCalled()
      expect(onFetchFinallySpy).toHaveBeenCalled()
    })
  })

  it('should emit onFetchError event', async () => {
    const onFetchErrorSpy = vi.fn()
    const onFetchResponseSpy = vi.fn()
    const onFetchFinallySpy = vi.fn()
    const { result } = await renderHook(() => useFetch(`${baseUrl}?status=400`))

    result.current.onFetchError(onFetchErrorSpy)
    result.current.onFetchResponse(onFetchResponseSpy)
    result.current.onFetchFinally(onFetchFinallySpy)

    await vi.waitFor(() => {
      expect(onFetchErrorSpy).toHaveBeenCalled()
      expect(onFetchResponseSpy).not.toHaveBeenCalled()
      expect(onFetchFinallySpy).toHaveBeenCalled()
    })
  })

  it('setting the request method w/ get and return type w/ json', async () => {
    const { result } = await renderHook(() => useFetch(jsonUrl).get().json())
    await vi.waitFor(() => {
      expect(result.current.data).toEqual(jsonMessage)
    })
  })

  it('setting the request method w/ post and return type w/ text', async () => {
    const { result } = await renderHook(() => useFetch(jsonUrl).post().text())
    await vi.waitFor(() => expect(result.current.data).toEqual(JSON.stringify(jsonMessage)))
  })

  it('allow setting response type before doing request', async () => {
    const { result } = await renderHook(() => useFetch(jsonUrl, {
      immediate: false,
    }).get().text())
    result.current.json()
    await result.current.execute()
    await vi.waitFor(() => {
      expect(result.current.data).toEqual(jsonMessage)
    })
  })

  it('not allowed setting request method and response type while doing request', async () => {
    const { result } = await renderHook(() => useFetch(jsonUrl).get().text())
    await vi.waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledOnce()
    })
    result.current.post()
    result.current.json()
    await vi.waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(result.current.data).toEqual(JSON.stringify(jsonMessage))
    })
  })

  it('should abort request when timeout reached', async () => {
    const { result } = await renderHook(() => useFetch(`${baseUrl}?delay=100`, { timeout: 10 }))

    await vi.waitFor(() => {
      expect(result.current.aborted).toBeTruthy()
    })
    await result.current.execute()
    await vi.waitFor(() => {
      expect(result.current.aborted).toBeTruthy()
    })
  })

  it('should not abort request when timeout is not reached', async () => {
    const { result } = await renderHook(() => useFetch(jsonUrl, { timeout: 100 }).json())
    await vi.waitFor(() => expect(result.current.data).toEqual(jsonMessage))
  })

  it('should await request', async () => {
    const { result } = await renderHook(() => useFetch(jsonUrl).get())
    const { data } = await result.current
    expect(data).toEqual(JSON.stringify(jsonMessage))
    expect(fetchSpy).toBeCalledTimes(1)
  })

  it('should await json response', async () => {
    const { result } = await renderHook(() => useFetch(jsonUrl).json())

    await result.current
    expect(result.current.data).toEqual(jsonMessage)
    expect(fetchSpy).toBeCalledTimes(1)
  })

  it('should abort previous request', async () => {
    const onFetchResponseSpy = vi.fn()
    const { result } = await renderHook(() => useFetch(baseUrl, { immediate: false }))

    result.current.onFetchResponse(onFetchResponseSpy)

    await Promise.all([
      result.current.execute(),
      result.current.execute(),
      result.current.execute(),
      result.current.execute(),
    ])

    await vi.waitFor(() => {
      expect(onFetchResponseSpy).toBeCalledTimes(1)
    })
  })

  it('should listen url ref change abort previous request', async () => {
    const url = { current: baseUrl }
    const onFetchResponseSpy = vi.fn()
    const { result } = await renderHook(() => useFetch(url, { refetch: true, immediate: false }))

    result.current.onFetchResponse(onFetchResponseSpy)

    url.current = `${baseUrl}?t=1`
    await nextTick()
    url.current = `${baseUrl}?t=2`
    await nextTick()
    url.current = `${baseUrl}?t=3`

    await vi.waitFor(() => {
      expect(onFetchResponseSpy).toBeCalledTimes(1)
    })
  })

  it('should clear error when refetch succeeds after aborting previous request', async () => {
    const url = { current: `${baseUrl}?delay=50` }
    const { result } = await renderHook(() => useFetch(url, { refetch: true }).json())
    await nextTick()
    url.current = jsonUrl
    await vi.waitFor(() => {
      expect(result.current.data).toEqual(jsonMessage)
    })
    expect(result.current.error).toBeNull()
  })

  it('should not overwrite the data of a newer request when a superseded one resolves', async () => {
    const secondMessage = { hello: 'again' }
    const url = { current: jsonUrl }
    let releaseFirst = () => {}
    const firstReleased = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })
    const afterFetchSpy = vi.fn()
    const responseSpy = vi.fn()

    const { result } = await renderHook(() => useFetch(url, {
      refetch: true,
      async afterFetch(ctx) {
        afterFetchSpy()
        if (ctx.data.hello === jsonMessage.hello)
          await firstReleased
        return ctx
      },
    }).json())
    result.current.onFetchResponse(responseSpy)

    await vi.waitFor(() => {
      expect(afterFetchSpy).toHaveBeenCalled()
    })
    url.current = `${baseUrl}/test?json=${encodeURI(JSON.stringify(secondMessage))}`
    await vi.waitFor(() => {
      expect(result.current.data).toEqual(secondMessage)
    })

    releaseFirst()
    await vi.waitFor(() => {
      expect(responseSpy).toHaveBeenCalledTimes(2)
    })
    expect(result.current.data).toEqual(secondMessage)
  })

  it('should be generated payloadType on execute', async () => {
    const form: { current: { x: number } | undefined } = { current: undefined }
    const { result } = await renderHook(() => useFetch(baseUrl).post(form))

    await vi.waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledOnce()
    })
    form.current = { x: 1 }
    await result.current.execute()

    await vi.waitFor(() => {
      expect(fetchSpyHeaders(1)['Content-Type']).toBe('application/json')
    })
  })

  it('should be generated payloadType on execute with formdata', async () => {
    // `immediate: false` — upstream's immediate request fires on a microtask
    // after setup (so it already sees the swapped-in FormData); React's mount
    // effect fires before the test body, so the FormData payload is provided
    // up-front and only `execute()` runs the request.
    const form: { current: { x: number } | undefined } = { current: { x: 1 } }
    const { result } = await renderHook(() => useFetch(baseUrl, { immediate: false }).post(form))

    form.current = new FormData() as any
    await result.current.execute()

    await vi.waitFor(() => {
      expect(fetchSpyHeaders()['Content-Type']).toBe(undefined)
    })
  })

  it('should be modified the request status after the request is completed', async () => {
    const { result } = await renderHook(() => useFetch(baseUrl, { immediate: false }))

    await result.current.execute()
    await vi.waitFor(() => {
      expect(result.current.isFetching).toBe(false)
      expect(result.current.isFinished).toBe(true)
    })
  })

  it('should be possible to re-trigger the request via the afterFetch parameters', async () => {
    let count = 0
    let captured: Partial<AfterFetchContext> = {}
    await renderHook(() => useFetch(baseUrl, {
      afterFetch: (ctx) => {
        !count && ctx.execute()
        count++
        captured = ctx
        return ctx
      },
    }))

    await vi.waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2)
      expect(captured?.context).toBeDefined()
      expect(captured?.execute).toBeDefined()
    })
  })

  it('should be possible to re-trigger the request via the onFetchError parameters', async () => {
    let count = 0
    let captured: Partial<OnFetchErrorContext> = {}
    await renderHook(() => useFetch(`${baseUrl}?status=400&json`, {
      onFetchError: (ctx) => {
        !count && ctx.execute()
        count++
        captured = ctx
        return ctx
      },
    }))

    await vi.waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2)
      expect(captured?.context).toBeDefined()
      expect(captured?.execute).toBeDefined()
    })
  })

  it('should partial overwrite when combination is overwrite', async () => {
    const useMyFetch = createFetchWithBaseUrl({
      combination: 'overwrite',
      options: {
        beforeFetch({ options }) {
          options.headers = { ...options.headers, before: 'Global' }
          return { options }
        },
        afterFetch(ctx) {
          ctx.data.after = 'Global'
          return ctx
        },
      },
    })

    const { result } = await renderHook(() => useMyFetch('test', {
      beforeFetch({ options }) {
        options.headers = { ...options.headers, before: 'Local' }
      },
    }).json())

    await vi.waitFor(() => {
      expect(fetchSpyHeaders()).toMatchObject({ before: 'Local' })
      expect(result.current.data).toEqual(expect.objectContaining({ after: 'Global' }))
    })
  })

  it('should abort with given reason', async () => {
    const { result } = await renderHook(() => useFetch(baseUrl, { immediate: false }))
    const reason = 'custom abort reason'
    let error: unknown
    result.current.onFetchError((err) => {
      error = err
    })
    result.current.execute()
    result.current.abort(reason)
    await vi.waitFor(() => {
      expect(result.current.aborted).toBe(true)
      expect(error).toBe(reason)
    })
  })
})
