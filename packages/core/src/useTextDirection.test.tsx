import type { UseTextDirectionValue } from './useTextDirection'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useTextDirection } from './useTextDirection'

let savedHtmlDir: string | null = null
let savedBodyDir: string | null = null

beforeEach(() => {
  // real documentElement.dir is mutable across tests in the shared chromium
  // page — save it here and restore after each test
  savedHtmlDir = document.documentElement.getAttribute('dir')
  savedBodyDir = document.body.getAttribute('dir')
})

afterEach(() => {
  if (savedHtmlDir === null)
    document.documentElement.removeAttribute('dir')
  else
    document.documentElement.setAttribute('dir', savedHtmlDir)

  if (savedBodyDir === null)
    document.body.removeAttribute('dir')
  else
    document.body.setAttribute('dir', savedBodyDir)
})

it('useTextDirection should be defined', () => {
  expect(useTextDirection).toBeDefined()
})

it('useTextDirection defaults to ltr when the element has no dir attribute', async () => {
  document.documentElement.removeAttribute('dir')

  const { result } = await renderHook(() => useTextDirection())

  expect(result.current[0]).toBe('ltr')
  expect(document.documentElement.getAttribute('dir')).toBeNull()
})

it('useTextDirection reads the initial dir from documentElement', async () => {
  document.documentElement.setAttribute('dir', 'rtl')

  const { result } = await renderHook(() => useTextDirection())

  expect(result.current[0]).toBe('rtl')
})

it('useTextDirection uses initialValue when no dir attribute exists', async () => {
  document.documentElement.removeAttribute('dir')

  const { result } = await renderHook(() => useTextDirection({ initialValue: 'rtl' }))

  expect(result.current[0]).toBe('rtl')
  expect(document.documentElement.getAttribute('dir')).toBeNull()
})

it('useTextDirection setter updates the state and writes dir back to the DOM', async () => {
  document.documentElement.removeAttribute('dir')

  const { result, act } = await renderHook(() => useTextDirection())

  expect(document.documentElement.getAttribute('dir')).toBeNull()

  await act(() => {
    result.current[1]('rtl')
  })

  expect(result.current[0]).toBe('rtl')
  expect(document.documentElement.getAttribute('dir')).toBe('rtl')

  // updater function form, like setState
  await act(() => {
    result.current[1](current => (current === 'rtl' ? 'ltr' : 'rtl'))
  })

  expect(result.current[0]).toBe('ltr')
  expect(document.documentElement.getAttribute('dir')).toBe('ltr')
})

it('useTextDirection supports a custom selector', async () => {
  document.body.removeAttribute('dir')
  document.documentElement.removeAttribute('dir')

  const { result, act } = await renderHook(() => useTextDirection({ selector: 'body' }))

  await act(() => {
    result.current[1]('rtl')
  })

  expect(result.current[0]).toBe('rtl')
  expect(document.body.getAttribute('dir')).toBe('rtl')
  expect(document.documentElement.getAttribute('dir')).toBeNull()
})

it('useTextDirection observes external dir changes on documentElement', async () => {
  document.documentElement.removeAttribute('dir')

  const { result } = await renderHook(() => useTextDirection({ observe: true }))

  expect(result.current[0]).toBe('ltr')

  // external mutation — the MutationObserver fires asynchronously
  document.documentElement.setAttribute('dir', 'rtl')

  await expect.poll(() => result.current[0]).toBe('rtl')
})

it('useTextDirection observes dir changes on a custom selector', async () => {
  document.body.removeAttribute('dir')
  document.documentElement.removeAttribute('dir')

  const { result } = await renderHook(() => useTextDirection({ observe: true, selector: 'body' }))

  document.body.setAttribute('dir', 'rtl')

  await expect.poll(() => result.current[0]).toBe('rtl')
  expect(document.documentElement.getAttribute('dir')).toBeNull()
})

it('useTextDirection disconnects its observer on unmount', async () => {
  document.documentElement.removeAttribute('dir')

  const { result, unmount } = await renderHook(() => useTextDirection({ observe: true }))

  expect(result.current[0]).toBe('ltr')

  unmount()

  document.documentElement.setAttribute('dir', 'rtl')

  // real timers — allow any (incorrectly) delivered mutation to land
  await new Promise(resolve => setTimeout(resolve, 50))

  expect(result.current[0]).toBe('ltr')
})

it('useTextDirection supports a custom document option', async () => {
  document.documentElement.removeAttribute('dir')

  const iframe = document.createElement('iframe')
  document.body.appendChild(iframe)

  try {
    const iframeDoc = iframe.contentDocument as Document
    iframeDoc.documentElement.setAttribute('dir', 'rtl')

    const { result, act } = await renderHook(() => useTextDirection({ document: iframeDoc }))

    expect(result.current[0]).toBe('rtl')

    await act(() => {
      result.current[1]('ltr')
    })

    expect(result.current[0]).toBe('ltr')
    expect(iframeDoc.documentElement.getAttribute('dir')).toBe('ltr')
    // the main document is untouched
    expect(document.documentElement.getAttribute('dir')).toBeNull()
  }
  finally {
    iframe.remove()
  }
})

it('useTextDirection renders the initialValue default during SSR (no document access in render)', async () => {
  // the DOM says rtl, but the hook must not read it during render — only the
  // mount effect syncs from the document
  document.documentElement.setAttribute('dir', 'rtl')

  let firstRenderValue: UseTextDirectionValue | undefined

  function Probe() {
    const [dir] = useTextDirection()
    firstRenderValue ??= dir
    return null
  }

  await render(<Probe />)

  expect(firstRenderValue).toBe('ltr')
})
