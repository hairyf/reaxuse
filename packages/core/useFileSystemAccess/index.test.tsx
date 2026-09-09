import type { Dispatch, SetStateAction } from 'react'
import type { UseFileSystemAccessControls, UseFileSystemAccessReturn } from '../useFileSystemAccess'
import { afterEach, expect, expectTypeOf, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useFileSystemAccess } from '../useFileSystemAccess'

/**
 * Minimal structural stand-in for the (non-exported)
 * `FileSystemWritableFileStream` interface.
 */
interface WritableStreamLike {
  write: ReturnType<typeof vi.fn>
  seek: ReturnType<typeof vi.fn>
  truncate: ReturnType<typeof vi.fn>
  close: ReturnType<typeof vi.fn>
}

/**
 * A `FileSystemWritableFileStream` double whose `write`/`close`/`seek`/
 * `truncate` are spies.
 */
class FakeWritableStream implements WritableStreamLike {
  write = vi.fn(async () => {})
  seek = vi.fn(async () => {})
  truncate = vi.fn(async () => {})
  close = vi.fn(async () => {})
}

/**
 * A `FileSystemFileHandle` double backed by a `File`. `getFile` and
 * `createWritable` are spies so tests can assert the control flow.
 */
class FakeFileHandle {
  file: File
  writable: FakeWritableStream
  getFile: ReturnType<typeof vi.fn>
  createWritable: ReturnType<typeof vi.fn>

  constructor(file: File) {
    this.file = file
    this.writable = new FakeWritableStream()
    this.getFile = vi.fn(async () => this.file)
    this.createWritable = vi.fn(async () => this.writable as unknown as WritableStreamLike)
  }
}

/**
 * Installs `window.showOpenFilePicker` / `window.showSaveFilePicker` doubles.
 * Returns spies on both so tests can configure or assert their behavior.
 */
function installPickers(handles: {
  open?: Array<FakeFileHandle>
  save?: FakeFileHandle
} = {}) {
  const openSpy = vi.fn(async () => handles.open ?? [])
  const saveSpy = vi.fn(async () => handles.save)
  vi.stubGlobal('showOpenFilePicker', openSpy)
  vi.stubGlobal('showSaveFilePicker', saveSpy)
  return { openSpy, saveSpy }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

it('should be defined', () => {
  expect(useFileSystemAccess).toBeDefined()
})

it('returns the React tuple [data, setData, controls]', async () => {
  installPickers()
  const { result } = await renderHook(() => useFileSystemAccess())

  expectTypeOf(result.current).toEqualTypeOf<
    readonly [
      string | ArrayBuffer | Blob | undefined,
      Dispatch<SetStateAction<string | ArrayBuffer | Blob | undefined>>,
      UseFileSystemAccessControls,
    ]
  >()
  expectTypeOf(result.current).toEqualTypeOf<UseFileSystemAccessReturn<string | ArrayBuffer | Blob>>()
  expectTypeOf(result.current[0]).toEqualTypeOf<string | ArrayBuffer | Blob | undefined>()
  expectTypeOf(result.current[1]).toEqualTypeOf<Dispatch<SetStateAction<string | ArrayBuffer | Blob | undefined>>>()
  expectTypeOf(result.current[2]).toEqualTypeOf<UseFileSystemAccessControls>()
  expectTypeOf(result.current[2].isSupported).toEqualTypeOf<boolean>()
  expectTypeOf(result.current[2].file).toEqualTypeOf<File | undefined>()
  expectTypeOf(result.current[2].fileName).toEqualTypeOf<string>()
  expectTypeOf(result.current[2].open).toEqualTypeOf<UseFileSystemAccessControls['open']>()

  expect(Array.isArray(result.current)).toBe(true)
  expect(result.current).toHaveLength(3)
  expect(result.current[1]).toBeTypeOf('function')
  expect(result.current[2]).toBeTypeOf('object')
})

it('exposes open/create/save/saveAs/updateData on the controls object', async () => {
  installPickers()
  const { result } = await renderHook(() => useFileSystemAccess())

  for (const name of ['open', 'create', 'save', 'saveAs', 'updateData'] as const)
    expect(result.current[2][name]).toBeTypeOf('function')
})

it('useFileSystemAccess reports support matching the environment', async () => {
  installPickers()

  const isSupportedInEnv = typeof window !== 'undefined'
    && 'showSaveFilePicker' in window
    && 'showOpenFilePicker' in window
  const { result } = await renderHook(() => useFileSystemAccess())

  await expect.poll(() => result.current[2].isSupported).toBe(isSupportedInEnv)
})

it('isSupported is false when the FileSystemAccess pickers are unavailable', async () => {
  const openDescriptor = Object.getOwnPropertyDescriptor(window, 'showOpenFilePicker')
  const saveDescriptor = Object.getOwnPropertyDescriptor(window, 'showSaveFilePicker')
  const hadOpen = 'showOpenFilePicker' in window
  const hadSave = 'showSaveFilePicker' in window
  if (hadOpen)
    Reflect.deleteProperty(window, 'showOpenFilePicker')
  if (hadSave)
    Reflect.deleteProperty(window, 'showSaveFilePicker')

  try {
    const { result } = await renderHook(() => useFileSystemAccess())
    await expect.poll(() => result.current[2].isSupported).toBe(false)
  }
  finally {
    if (openDescriptor)
      Object.defineProperty(window, 'showOpenFilePicker', openDescriptor)
    if (saveDescriptor)
      Object.defineProperty(window, 'showSaveFilePicker', saveDescriptor)
  }
})

it('open() reads the picked file as Text by default and exposes its metadata', async () => {
  const file = new File(['hello world'], 'hello.txt', { type: 'text/plain' })
  const handle = new FakeFileHandle(file)
  const { openSpy } = installPickers({ open: [handle] })

  const { result, act } = await renderHook(() => useFileSystemAccess())

  await expect.poll(() => result.current[2].isSupported).toBe(true)
  await act(async () => {
    await result.current[2].open()
  })

  expect(openSpy).toHaveBeenCalledTimes(1)
  expect(handle.getFile).toHaveBeenCalled()
  expect(result.current[0]).toBe('hello world')
  expect(result.current[2].file).toBe(file)
  expect(result.current[2].fileName).toBe('hello.txt')
  expect(result.current[2].fileMIME).toBe('text/plain')
  expect(result.current[2].fileSize).toBe(file.size)
  expect(result.current[2].fileLastModified).toBe(file.lastModified)
})

it('setData() updates the returned data and supports functional updates', async () => {
  const file = new File(['hello world'], 'hello.txt', { type: 'text/plain' })
  const handle = new FakeFileHandle(file)
  installPickers({ open: [handle] })

  const { result, act } = await renderHook(() => useFileSystemAccess())

  await expect.poll(() => result.current[2].isSupported).toBe(true)
  await act(async () => {
    await result.current[2].open()
  })
  expect(result.current[0]).toBe('hello world')

  await act(async () => {
    result.current[1]('edited')
  })
  expect(result.current[0]).toBe('edited')

  await act(async () => {
    result.current[1](prev => typeof prev === 'string' ? `${prev}!` : prev)
  })
  expect(result.current[0]).toBe('edited!')

  // `setData` is local state — the picked handle is untouched until `save()`
  expect(handle.writable.write).not.toHaveBeenCalled()
})

it('open() forwards types/excludeAcceptAllOption to showOpenFilePicker', async () => {
  const handle = new FakeFileHandle(new File(['x'], 'x.txt', { type: 'text/plain' }))
  const { openSpy } = installPickers({ open: [handle] })

  const { result, act } = await renderHook(() => useFileSystemAccess({
    types: [{ description: 'text', accept: { 'text/plain': ['.txt'] } }],
    excludeAcceptAllOption: true,
  }))

  await expect.poll(() => result.current[2].isSupported).toBe(true)
  await act(async () => {
    await result.current[2].open({ excludeAcceptAllOption: false })
  })

  expect(openSpy).toHaveBeenCalledWith({
    types: [{ description: 'text', accept: { 'text/plain': ['.txt'] } }],
    excludeAcceptAllOption: false,
  })
})

it('open() resolves without picking anything when unsupported', async () => {
  const openDescriptor = Object.getOwnPropertyDescriptor(window, 'showOpenFilePicker')
  const saveDescriptor = Object.getOwnPropertyDescriptor(window, 'showSaveFilePicker')
  const hadOpen = 'showOpenFilePicker' in window
  const hadSave = 'showSaveFilePicker' in window
  if (hadOpen)
    Reflect.deleteProperty(window, 'showOpenFilePicker')
  if (hadSave)
    Reflect.deleteProperty(window, 'showSaveFilePicker')

  try {
    const { result, act } = await renderHook(() => useFileSystemAccess())
    await expect.poll(() => result.current[2].isSupported).toBe(false)

    let opened: void | undefined
    await act(async () => {
      opened = await result.current[2].open()
    })
    expect(opened).toBeUndefined()
  }
  finally {
    if (openDescriptor)
      Object.defineProperty(window, 'showOpenFilePicker', openDescriptor)
    if (saveDescriptor)
      Object.defineProperty(window, 'showSaveFilePicker', saveDescriptor)
  }
})

it('reads the picked file as ArrayBuffer when dataType is ArrayBuffer', async () => {
  const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
  const handle = new FakeFileHandle(file)
  installPickers({ open: [handle] })

  const { result, act } = await renderHook(() => useFileSystemAccess({ dataType: 'ArrayBuffer' }))

  await expect.poll(() => result.current[2].isSupported).toBe(true)
  await act(async () => {
    await result.current[2].open()
  })

  expect(result.current[0]).toBeInstanceOf(ArrayBuffer)
  expect(new TextDecoder().decode(result.current[0] as ArrayBuffer)).toBe('hello')
})

it('reads the picked file as Blob when dataType is Blob', async () => {
  const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
  const handle = new FakeFileHandle(file)
  installPickers({ open: [handle] })

  const { result, act } = await renderHook(() => useFileSystemAccess({ dataType: 'Blob' }))

  await expect.poll(() => result.current[2].isSupported).toBe(true)
  await act(async () => {
    await result.current[2].open()
  })

  expect(result.current[0]).toBe(file)
})

it('save() writes the current data to the picked handle', async () => {
  const file = new File(['hello world'], 'hello.txt', { type: 'text/plain' })
  const handle = new FakeFileHandle(file)
  installPickers({ open: [handle] })

  const { result, act } = await renderHook(() => useFileSystemAccess())

  await expect.poll(() => result.current[2].isSupported).toBe(true)
  await act(async () => {
    await result.current[2].open()
  })

  await act(async () => {
    await result.current[2].save()
  })

  expect(handle.createWritable).toHaveBeenCalledTimes(1)
  expect(handle.writable.write).toHaveBeenCalledWith('hello world')
  expect(handle.writable.close).toHaveBeenCalled()
})

it('save() persists data replaced through setData()', async () => {
  const file = new File(['hello world'], 'hello.txt', { type: 'text/plain' })
  const handle = new FakeFileHandle(file)
  installPickers({ open: [handle] })

  const { result, act } = await renderHook(() => useFileSystemAccess())

  await expect.poll(() => result.current[2].isSupported).toBe(true)
  await act(async () => {
    await result.current[2].open()
  })

  await act(async () => {
    result.current[1]('edited content')
  })
  await act(async () => {
    await result.current[2].save()
  })

  expect(handle.writable.write).toHaveBeenCalledWith('edited content')
})

it('save() falls back to saveAs() when no handle was picked', async () => {
  const file = new File(['hello world'], 'hello.txt', { type: 'text/plain' })
  const saveHandle = new FakeFileHandle(file)
  const { openSpy, saveSpy } = installPickers({ save: saveHandle })

  const { result, act } = await renderHook(() => useFileSystemAccess())

  await expect.poll(() => result.current[2].isSupported).toBe(true)
  await act(async () => {
    await result.current[2].save()
  })

  expect(openSpy).not.toHaveBeenCalled()
  expect(saveSpy).toHaveBeenCalledTimes(1)
  expect(saveHandle.createWritable).not.toHaveBeenCalled()
})

it('saveAs() writes the current data to a newly picked handle', async () => {
  const file = new File(['hello world'], 'hello.txt', { type: 'text/plain' })
  const openHandle = new FakeFileHandle(file)
  const saveHandle = new FakeFileHandle(file)
  const { saveSpy } = installPickers({ open: [openHandle], save: saveHandle })

  const { result, act } = await renderHook(() => useFileSystemAccess())

  await expect.poll(() => result.current[2].isSupported).toBe(true)
  await act(async () => {
    await result.current[2].open()
  })

  await act(async () => {
    await result.current[2].saveAs()
  })

  expect(saveSpy).toHaveBeenCalledTimes(1)
  expect(saveHandle.createWritable).toHaveBeenCalledTimes(1)
  expect(saveHandle.writable.write).toHaveBeenCalledWith('hello world')
  expect(saveHandle.writable.close).toHaveBeenCalled()
})

it('create() picks a new handle and reads it back', async () => {
  const file = new File(['created'], 'new.txt', { type: 'text/plain' })
  const saveHandle = new FakeFileHandle(file)
  const { saveSpy } = installPickers({ save: saveHandle })

  const { result, act } = await renderHook(() => useFileSystemAccess())

  await expect.poll(() => result.current[2].isSupported).toBe(true)
  await act(async () => {
    await result.current[2].create()
  })

  expect(saveSpy).toHaveBeenCalledTimes(1)
  expect(result.current[0]).toBe('created')
  expect(result.current[2].fileName).toBe('new.txt')
})

it('updateData() re-reads the file after external mutation', async () => {
  const initial = new File(['a'], 'hello.txt', { type: 'text/plain' })
  const handle = new FakeFileHandle(initial)
  installPickers({ open: [handle] })

  const { result, act } = await renderHook(() => useFileSystemAccess())

  await expect.poll(() => result.current[2].isSupported).toBe(true)
  await act(async () => {
    await result.current[2].open()
  })
  expect(result.current[0]).toBe('a')

  handle.file = new File(['b'], 'hello.txt', { type: 'text/plain' })
  await act(async () => {
    await result.current[2].updateData()
  })

  expect(result.current[0]).toBe('b')
})

it('switching dataType re-reads the current file', async () => {
  const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
  const handle = new FakeFileHandle(file)
  installPickers({ open: [handle] })

  const dataType = { current: 'Text' } as { current: 'Text' | 'ArrayBuffer' | 'Blob' }
  const { result, act, rerender } = await renderHook(() => useFileSystemAccess({ dataType }))

  await expect.poll(() => result.current[2].isSupported).toBe(true)
  await act(async () => {
    await result.current[2].open()
  })
  expect(result.current[0]).toBe('hello')

  dataType.current = 'ArrayBuffer'
  await rerender()
  await act(async () => {
    await result.current[2].updateData()
  })
  expect(result.current[0]).toBeInstanceOf(ArrayBuffer)
})

it('controls are identity-stable across renders', async () => {
  installPickers()
  const dataType = { current: 'Text' } as { current: 'Text' | 'ArrayBuffer' | 'Blob' }
  const { result, rerender } = await renderHook(() => useFileSystemAccess({ dataType }))

  const first = result.current
  dataType.current = 'ArrayBuffer'
  await rerender()
  const second = result.current

  expect(second[2]).toBe(first[2])
  expect(second[2].open).toBe(first[2].open)
  expect(second[2].create).toBe(first[2].create)
  expect(second[2].save).toBe(first[2].save)
  expect(second[2].saveAs).toBe(first[2].saveAs)
  expect(second[2].updateData).toBe(first[2].updateData)
})

it('keeps SSR-safe defaults during render and resolves in a mount effect', async () => {
  installPickers()

  const values: Array<{ isSupported: boolean, fileName: string, data: unknown }> = []

  function Probe() {
    const [data, , { isSupported, fileName }] = useFileSystemAccess()
    values.push({ isSupported, fileName, data })

    return <div>{isSupported ? 'supported' : 'unsupported'}</div>
  }

  const screen = await render(<Probe />)

  // render-time values are the SSR-safe defaults
  expect(values[0].isSupported).toBe(false)
  expect(values[0].fileName).toBe('')
  expect(values[0].data).toBeUndefined()

  // the mount effect probes the API and re-renders
  await expect.element(screen.getByText('supported')).toBeVisible()
  expect(values[values.length - 1].isSupported).toBe(true)
  expect(values[values.length - 1].fileName).toBe('')
})

it('supports a custom window instance via options.window', async () => {
  const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
  const handle = new FakeFileHandle(file)

  const customWindow = {
    showOpenFilePicker: vi.fn(async () => [handle]),
    showSaveFilePicker: vi.fn(async () => handle),
  } as never

  const { result, act } = await renderHook(() => useFileSystemAccess({ window: customWindow }))

  await expect.poll(() => result.current[2].isSupported).toBe(true)
  await act(async () => {
    await result.current[2].open()
  })
  expect(result.current[0]).toBe('hello')
})
