import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useScriptTag } from './useScriptTag'

declare global {
  interface Window {
    __reaxuseUseScriptTagTestFlag?: boolean
  }
}

// Deterministic srcs — no network involved:
// - a `data:` URL loads (and executes) in chromium, firing the `load` event;
// - port 1 is in chromium's restricted-port list, so the fetch fails with
//   ERR_UNSAFE_PORT and fires the `error` event without leaving the machine.
const GOOD_SRC = 'data:text/javascript,window.__reaxuseUseScriptTagTestFlag = true'
const BAD_SRC = 'http://127.0.0.1:1/reaxuse-use-script-tag-test.js'

function scriptTagElement(src: string): HTMLScriptElement | null {
  return document.head.querySelector(`script[src="${src}"]`)
}

beforeEach(() => {
  document.head.innerHTML = ''
  window.__reaxuseUseScriptTagTestFlag = undefined
})

afterEach(() => {
  vi.restoreAllMocks()
})

it('should add script tag', async () => {
  const appendChildListener = vi.spyOn(document.head, 'appendChild')

  expect(appendChildListener).not.toBeCalled()
  expect(scriptTagElement(GOOD_SRC)).toBeNull()

  await renderHook(() => useScriptTag(GOOD_SRC, () => {}, { immediate: true }))

  expect(appendChildListener).toBeCalled()

  const element = scriptTagElement(GOOD_SRC)
  expect(element).toBeInstanceOf(HTMLScriptElement)
  expect(element?.type).toBe('text/javascript')
  expect(element?.async).toBe(true)
})

it('should re-use the same src for multiple loads', async () => {
  const addChildListener = vi.spyOn(document.head, 'appendChild')

  expect(addChildListener).not.toBeCalled()
  expect(scriptTagElement(GOOD_SRC)).toBeNull()

  const { result, act } = await renderHook(() => {
    const script1 = useScriptTag(GOOD_SRC, () => {}, { immediate: false, manual: true })
    const script2 = useScriptTag(GOOD_SRC, () => {}, { immediate: false, manual: true })

    return { script1, script2 }
  })

  const { script1, script2 } = result.current

  let element1: HTMLScriptElement | boolean = false
  let element2: HTMLScriptElement | boolean = false
  await act(async () => {
    const [loaded1, loaded2] = await Promise.all([script1.load(false), script2.load(false)])
    element1 = loaded1
    element2 = loaded2
  })

  expect(element1).toBeInstanceOf(HTMLScriptElement)
  expect(element2).toBe(element1)
  expect(result.current.script1.scriptTag).not.toBeNull()
  expect(result.current.script2.scriptTag).not.toBeNull()

  expect(addChildListener).toBeCalledTimes(1)
  expect(scriptTagElement(GOOD_SRC)).toBeInstanceOf(HTMLScriptElement)
})

it('should support custom attributes', async () => {
  const appendChildListener = vi.spyOn(document.head, 'appendChild')

  expect(appendChildListener).not.toBeCalled()
  expect(scriptTagElement(GOOD_SRC)).toBeNull()

  await renderHook(() => useScriptTag(GOOD_SRC, () => {}, {
    attrs: { 'id': 'id-value', 'data-test': 'data-test-value' },
    defer: true,
    nonce: 'nonce-value',
    immediate: true,
  }))

  expect(appendChildListener).toBeCalled()

  const element = scriptTagElement(GOOD_SRC)
  expect(element).toBeInstanceOf(HTMLScriptElement)
  expect(element?.getAttribute('id')).toBe('id-value')
  expect(element?.getAttribute('data-test')).toBe('data-test-value')
  expect(element?.defer).toBe(true)
  expect(element?.nonce).toBe('nonce-value')
})

it('should remove script tag on unmount', async () => {
  const removeChildListener = vi.spyOn(document.head, 'removeChild')

  expect(removeChildListener).not.toBeCalled()
  expect(scriptTagElement(BAD_SRC)).toBeNull()

  const { result, act, unmount } = await renderHook(() => useScriptTag(BAD_SRC, () => {}, { immediate: false }))

  // immediate: false without manual — nothing is loaded on mount
  expect(scriptTagElement(BAD_SRC)).toBeNull()

  await act(async () => {
    await result.current.load(false)
  })

  expect(scriptTagElement(BAD_SRC)).toBeInstanceOf(HTMLScriptElement)

  await unmount()

  expect(scriptTagElement(BAD_SRC)).toBeNull()
  expect(removeChildListener).toBeCalled()
})

it('should remove script tag on unload call', async () => {
  const removeChildListener = vi.spyOn(document.head, 'removeChild')

  expect(removeChildListener).not.toBeCalled()
  expect(scriptTagElement(BAD_SRC)).toBeNull()

  const { result, act } = await renderHook(() => useScriptTag(BAD_SRC, () => {}, { immediate: false }))

  await act(async () => {
    await result.current.load(false)
  })

  expect(scriptTagElement(BAD_SRC)).toBeInstanceOf(HTMLScriptElement)

  await act(async () => {
    result.current.unload()
  })

  expect(scriptTagElement(BAD_SRC)).toBeNull()
  expect(removeChildListener).toBeCalled()
  expect(result.current.scriptTag).toBeNull()
})

it('should remove script tag on unload call after multiple loads', async () => {
  const removeChildListener = vi.spyOn(document.head, 'removeChild')

  expect(removeChildListener).not.toBeCalled()
  expect(scriptTagElement(BAD_SRC)).toBeNull()

  const { result, act } = await renderHook(() => {
    const script1 = useScriptTag(BAD_SRC, () => {}, { immediate: false, manual: true })
    const script2 = useScriptTag(BAD_SRC, () => {}, { immediate: false, manual: true })

    return { script1, script2 }
  })

  const { script1, script2 } = result.current

  // Multiple loads
  await act(async () => {
    await Promise.all([script1.load(false), script2.load(false)])
  })

  expect(scriptTagElement(BAD_SRC)).toBeInstanceOf(HTMLScriptElement)

  await act(async () => {
    script1.unload()
    script2.unload()
  })

  expect(result.current.script1.scriptTag).toBeNull()
  expect(result.current.script2.scriptTag).toBeNull()
  expect(removeChildListener).toBeCalledTimes(1)
  expect(scriptTagElement(BAD_SRC)).toBeNull()
})

it('should call onLoaded once the script loads and re-use a data-loaded tag', async () => {
  const onLoaded1 = vi.fn()
  const onLoaded2 = vi.fn()

  const { result, act } = await renderHook(() => {
    const script1 = useScriptTag(GOOD_SRC, onLoaded1, { immediate: false, manual: true })
    const script2 = useScriptTag(GOOD_SRC, onLoaded2, { immediate: false, manual: true })

    return { script1, script2 }
  })

  const { script1, script2 } = result.current

  let loaded: HTMLScriptElement | boolean = false
  await act(async () => {
    loaded = await script1.load()
  })

  expect(loaded).toBeInstanceOf(HTMLScriptElement)
  expect(onLoaded1).toBeCalledTimes(1)
  expect(onLoaded1).toBeCalledWith(loaded)
  expect(scriptTagElement(GOOD_SRC)?.getAttribute('data-loaded')).toBe('true')
  expect(window.__reaxuseUseScriptTagTestFlag).toBe(true)

  // A second tag for the same src resolves with the existing element
  // without loading (or calling onLoaded) again.
  let reused: HTMLScriptElement | boolean = true
  await act(async () => {
    reused = await script2.load()
  })

  expect(reused).toBe(loaded)
  expect(onLoaded2).not.toBeCalled()
  expect(result.current.script2.scriptTag).not.toBeNull()
})

it('should reject when the script fails to load', async () => {
  const onLoaded = vi.fn()

  const { result } = await renderHook(() => useScriptTag(BAD_SRC, onLoaded, { immediate: false, manual: true }))

  const promise = result.current.load()

  await expect(promise).rejects.toBeInstanceOf(Event)

  // the tag stays in the head — only `unload` removes it
  expect(scriptTagElement(BAD_SRC)).toBeInstanceOf(HTMLScriptElement)
  expect(scriptTagElement(BAD_SRC)?.hasAttribute('data-loaded')).toBe(false)
  expect(onLoaded).not.toBeCalled()
  expect(result.current.scriptTag).toBeNull()
})
