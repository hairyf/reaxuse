import type { ModelContext, UseWebMCPOptions, WebMCPToolDescriptor } from '../useWebMCP'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useWebMCP } from '../useWebMCP'

interface RegisteredTool {
  descriptor: WebMCPToolDescriptor
  aborted: () => boolean
}

type TestDocument = Document & { modelContext?: ModelContext }

function modelContextDocument() {
  return document as TestDocument
}

function createRegisterTool(tools: RegisteredTool[]) {
  return vi.fn((descriptor: WebMCPToolDescriptor, options?: { signal?: AbortSignal }) => {
    const signal = options?.signal
    tools.push({
      descriptor,
      aborted: () => Boolean(signal?.aborted),
    })
  })
}

function installModelContext() {
  const tools: RegisteredTool[] = []
  const registerTool = createRegisterTool(tools)
  modelContextDocument().modelContext = { registerTool }
  return { tools, registerTool }
}

function removeModelContext() {
  delete modelContextDocument().modelContext
}

describe('useWebMCP', () => {
  beforeEach(() => {
    removeModelContext()
  })

  afterEach(() => {
    removeModelContext()
  })

  it('is defined', () => {
    expect(useWebMCP).toBeTypeOf('function')
  })

  it('reports unsupported and stays a no-op when the API is absent', async () => {
    const { result } = await renderHook(() => useWebMCP({
      name: 'noop',
      description: 'no-op',
      execute: () => 'ok',
    }))

    await expect.poll(() => result.current.isSupported).toBe(false)
    expect(result.current.isRegistered).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('reports unsupported when modelContext lacks a callable registerTool', async () => {
    modelContextDocument().modelContext = {} // present but incomplete

    const { result } = await renderHook(() => useWebMCP({
      name: 'noop',
      description: 'no-op',
      execute: () => 'ok',
    }))

    await expect.poll(() => result.current.isSupported).toBe(false)
    expect(result.current.isRegistered).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('registers on mount with the resolved descriptor and unregisters on unmount', async () => {
    const { tools, registerTool } = installModelContext()
    const inputSchema = { type: 'object', properties: { text: { type: 'string' } } }
    const annotations = { readOnlyHint: false }

    const { result, unmount } = await renderHook(() => useWebMCP({
      name: 'add-todo',
      description: 'Add a todo',
      inputSchema,
      annotations,
      execute: () => 'ok',
    }))

    await expect.poll(() => result.current.isRegistered).toBe(true)
    expect(result.current.isSupported).toBe(true)
    expect(result.current.error).toBeNull()
    expect(registerTool).toHaveBeenCalledTimes(1)
    expect(tools).toHaveLength(1)
    expect(tools[0].descriptor.name).toBe('add-todo')
    expect(tools[0].descriptor.description).toBe('Add a todo')
    expect(tools[0].descriptor.inputSchema).toBe(inputSchema)
    expect(tools[0].descriptor.annotations).toBe(annotations)
    expect(tools[0].aborted()).toBe(false)

    // Aborting the signal is how WebMCP unregisters a tool.
    await unmount()
    expect(tools[0].aborted()).toBe(true)
  })

  it('re-registers when the inputSchema changes', async () => {
    const { tools, registerTool } = installModelContext()

    const { result, rerender, unmount } = await renderHook(
      (props: { inputSchema: object }) => useWebMCP({
        name: 'schema-change',
        description: 'schema change tool',
        inputSchema: props.inputSchema,
        execute: () => 'ok',
      }),
      { initialProps: { inputSchema: { type: 'object' } } },
    )

    await expect.poll(() => result.current.isRegistered).toBe(true)
    expect(registerTool).toHaveBeenCalledTimes(1)

    const nextSchema = { type: 'object', properties: { text: { type: 'string' } } }
    await rerender({ inputSchema: nextSchema })
    await expect.poll(() => registerTool).toHaveBeenCalledTimes(2)
    expect(tools[1].descriptor.inputSchema).toBe(nextSchema)
    await unmount()
  })

  it('does not register while `enabled` is false, and (un)registers as it toggles', async () => {
    const { registerTool } = installModelContext()

    const { result, rerender, unmount } = await renderHook(
      (props: { enabled: boolean }) => useWebMCP({
        name: 'toggle',
        description: 'toggle tool',
        enabled: props.enabled,
        execute: () => 'ok',
      }),
      { initialProps: { enabled: false } },
    )

    await expect.poll(() => result.current.isSupported).toBe(true)
    expect(registerTool).not.toHaveBeenCalled()
    expect(result.current.isRegistered).toBe(false)

    await rerender({ enabled: true })
    await expect.poll(() => result.current.isRegistered).toBe(true)
    expect(registerTool).toHaveBeenCalledTimes(1)

    await rerender({ enabled: false })
    await expect.poll(() => result.current.isRegistered).toBe(false)
    await unmount()
  })

  it('re-registers when a discoverable field changes', async () => {
    const { registerTool } = installModelContext()

    const { result, rerender, unmount } = await renderHook(
      (props: { description: string }) => useWebMCP({
        name: 'search',
        description: props.description,
        execute: () => 'ok',
      }),
      { initialProps: { description: 'v1' } },
    )

    await expect.poll(() => result.current.isRegistered).toBe(true)
    expect(registerTool).toHaveBeenCalledTimes(1)

    await rerender({ description: 'v2' })
    await expect.poll(() => registerTool).toHaveBeenCalledTimes(2)
    await unmount()
  })

  it('does not re-register when a content-equal schema is passed', async () => {
    const { registerTool } = installModelContext()
    const schema = { type: 'object', properties: { a: { type: 'string' } } }

    const { result, rerender, unmount } = await renderHook(
      (props: { inputSchema: object }) => useWebMCP({
        name: 'schema',
        description: 'schema tool',
        inputSchema: props.inputSchema,
        execute: () => 'ok',
      }),
      { initialProps: { inputSchema: schema } },
    )

    await expect.poll(() => result.current.isRegistered).toBe(true)
    expect(registerTool).toHaveBeenCalledTimes(1)

    // New object, same content → no churn.
    await rerender({ inputSchema: { type: 'object', properties: { a: { type: 'string' } } } })
    expect(registerTool).toHaveBeenCalledTimes(1)
    await unmount()
  })

  it('captures a registration error (e.g. NotAllowedError)', async () => {
    const blocked = new Error('blocked')
    blocked.name = 'NotAllowedError'
    modelContextDocument().modelContext = {
      registerTool: vi.fn(() => {
        throw blocked
      }),
    }

    const { result } = await renderHook(() => useWebMCP({
      name: 'blocked',
      description: 'blocked tool',
      execute: () => 'ok',
    }))

    await expect.poll(() => result.current.error).toBe(blocked)
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.name).toBe('NotAllowedError')
    expect(result.current.isRegistered).toBe(false)
  })

  it('registers through a custom document option without touching the global one', async () => {
    const tools: RegisteredTool[] = []
    const registerTool = createRegisterTool(tools)
    const customDocument = { modelContext: { registerTool } } as unknown as Document

    const { result, unmount } = await renderHook(() => useWebMCP({
      name: 'custom',
      description: 'custom document tool',
      document: customDocument,
      execute: () => 'ok',
    }))

    await expect.poll(() => result.current.isRegistered).toBe(true)
    expect(registerTool).toHaveBeenCalledTimes(1)
    expect(tools[0].descriptor.name).toBe('custom')
    await unmount()
  })

  it('does not re-register when the execute closure changes, and calls the latest one', async () => {
    const { tools, registerTool } = installModelContext()
    const first = vi.fn(() => 'first')
    const second = vi.fn(() => 'second')

    const { result, rerender, unmount } = await renderHook(
      (props: { execute: () => string }) => useWebMCP({
        name: 'swap',
        description: 'swap tool',
        execute: props.execute,
      }),
      { initialProps: { execute: first } },
    )

    await expect.poll(() => result.current.isRegistered).toBe(true)
    expect(registerTool).toHaveBeenCalledTimes(1)

    await rerender({ execute: second })
    expect(registerTool).toHaveBeenCalledTimes(1)

    expect(await tools[0].descriptor.execute({})).toEqual({ content: [{ type: 'text', text: 'second' }] })
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
    await unmount()
  })

  it('does not re-register when the formatOutput closure changes, and calls the latest one', async () => {
    const { tools, registerTool } = installModelContext()
    const first = vi.fn((result: number) => `first=${result}`)
    const second = vi.fn((result: number) => `second=${result}`)

    const { result, rerender, unmount } = await renderHook(
      (props: { formatOutput: (result: number) => string }) => useWebMCP({
        name: 'format',
        description: 'format tool',
        execute: () => 1,
        formatOutput: props.formatOutput,
      }),
      { initialProps: { formatOutput: first } },
    )

    await expect.poll(() => result.current.isRegistered).toBe(true)
    expect(registerTool).toHaveBeenCalledTimes(1)

    await rerender({ formatOutput: second })
    expect(registerTool).toHaveBeenCalledTimes(1)

    expect(await tools[0].descriptor.execute({})).toEqual({ content: [{ type: 'text', text: 'second=1' }] })
    expect(first).not.toHaveBeenCalled()
    await unmount()
  })

  describe('result normalization', () => {
    async function runExecute<Args extends Record<string, unknown>, Result>(
      execute: (args: Args) => Result | Promise<Result>,
      args: Args = {} as Args,
      options: Omit<UseWebMCPOptions<Args, Result>, 'name' | 'description' | 'execute'> = {},
    ) {
      const { tools } = installModelContext()
      const { result, unmount } = await renderHook(() => useWebMCP<Args, Result>({
        name: 't',
        description: 'd',
        execute,
        ...options,
      }))
      await expect.poll(() => result.current.isRegistered).toBe(true)
      const res = await tools[0].descriptor.execute(args)
      await unmount()
      return res
    }

    it('wraps a string in a text block', async () => {
      expect(await runExecute(() => 'hi')).toEqual({ content: [{ type: 'text', text: 'hi' }] })
    })

    it('awaits an async execute result', async () => {
      expect(await runExecute(async () => 'hi')).toEqual({ content: [{ type: 'text', text: 'hi' }] })
    })

    it('maps undefined/null to an empty successful result', async () => {
      expect(await runExecute(() => undefined)).toEqual({ content: [] })
      expect(await runExecute(() => null)).toEqual({ content: [] })
    })

    it('passes an already-formed tool result through untouched', async () => {
      const already = { content: [{ type: 'text', text: 'x' }] }
      expect(await runExecute(() => already)).toBe(already)
    })

    it('serializes other values to JSON text', async () => {
      expect(await runExecute(() => ({ a: 1 }))).toEqual({ content: [{ type: 'text', text: '{"a":1}' }] })
      expect(await runExecute(() => [1, 2])).toEqual({ content: [{ type: 'text', text: '[1,2]' }] })
      expect(await runExecute(() => 42)).toEqual({ content: [{ type: 'text', text: '42' }] })
    })

    it('does not throw on non-serializable (circular / BigInt) results', async () => {
      const circular: Record<string, unknown> = {}
      circular.self = circular
      const circularRes = await runExecute(() => circular)
      expect(circularRes.isError).toBeUndefined()
      expect(circularRes.content[0].type).toBe('text')
      expect(circularRes.content[0].text).toBe('[object Object]')

      const bigintRes = await runExecute(() => 10n)
      expect(bigintRes.isError).toBeUndefined()
      expect(bigintRes.content[0].text).toBe('10')
    })

    it('turns a thrown Error into an isError result and calls onError', async () => {
      const onError = vi.fn()
      const res = await runExecute(() => {
        throw new Error('boom')
      }, {}, { onError })
      expect(res).toEqual({ content: [{ type: 'text', text: 'boom' }], isError: true })
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'boom' }))
    })

    it('turns a thrown non-Error into an isError result', async () => {
      const thrownString = await runExecute(() => {
        // eslint-disable-next-line no-throw-literal
        throw 'nope'
      })
      expect(thrownString).toEqual({ content: [{ type: 'text', text: 'nope' }], isError: true })

      const thrownObject = await runExecute(() => {
        // eslint-disable-next-line no-throw-literal
        throw { code: 403 }
      })
      expect(thrownObject).toEqual({ content: [{ type: 'text', text: '{"code":403}' }], isError: true })
    })

    it('treats a returned Error like a throw', async () => {
      const onError = vi.fn()
      const res = await runExecute(() => new Error('returned'), {}, { onError })
      expect(res).toEqual({ content: [{ type: 'text', text: 'returned' }], isError: true })
      expect(onError).toHaveBeenCalledTimes(1)
    })

    it('does not let a throwing onError break the tool execution path', async () => {
      const onError = vi.fn(() => {
        throw new Error('onError blew up')
      })
      const res = await runExecute(() => {
        throw new Error('boom')
      }, {}, { onError })
      expect(res).toEqual({ content: [{ type: 'text', text: 'boom' }], isError: true })
      expect(onError).toHaveBeenCalledTimes(1)
    })

    it('applies formatOutput before normalization', async () => {
      const res = await runExecute(
        () => ({ raw: 1 }),
        {},
        { formatOutput: result => `count=${result.raw}` },
      )
      expect(res).toEqual({ content: [{ type: 'text', text: 'count=1' }] })
    })
  })
})
