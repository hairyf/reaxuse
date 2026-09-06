import { afterEach, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useShare } from './useShare'

type ShareableMember = 'share' | 'canShare'

// Descriptors of the members shadowed on the real navigator, restored in
// afterEach so every test starts from the browser's own Web Share API state.
const stubbedMembers = new Map<ShareableMember, PropertyDescriptor | undefined>()

function stubNavigatorMember(member: ShareableMember, value: unknown) {
  if (!stubbedMembers.has(member))
    stubbedMembers.set(member, Object.getOwnPropertyDescriptor(window.navigator, member))
  Object.defineProperty(window.navigator, member, { configurable: true, value })
}

function stubShareableNavigator(canShareResult = true) {
  const share = vi.fn(() => Promise.resolve())
  const canShare = vi.fn(() => canShareResult)
  stubNavigatorMember('share', share)
  stubNavigatorMember('canShare', canShare)
  return { share, canShare }
}

afterEach(() => {
  for (const [member, descriptor] of stubbedMembers) {
    if (descriptor)
      Object.defineProperty(window.navigator, member, descriptor)
    else
      delete (window.navigator as unknown as Record<string, unknown>)[member]
  }
  stubbedMembers.clear()
})

it('useShare reports isSupported true when the navigator exposes canShare', async () => {
  stubNavigatorMember('canShare', () => true)

  const { result } = await renderHook(() => useShare())

  expect(result.current.isSupported).toBe(true)
})

it('useShare reports isSupported false for a navigator without canShare', async () => {
  const { result } = await renderHook(() => useShare({}, { navigator: {} as Navigator }))

  expect(result.current.isSupported).toBe(false)

  await expect(result.current.share({ text: 'ignored' })).resolves.toBeUndefined()
})

it('useShare merges hook options with call-time overrides (overrides win)', async () => {
  const { share, canShare } = stubShareableNavigator()
  const { result } = await renderHook(() => useShare({ title: 'Hello', text: 'from the hook' }))

  await result.current.share({ text: 'call-time', url: 'https://reaxuse.dev' })

  const merged = { title: 'Hello', text: 'call-time', url: 'https://reaxuse.dev' }
  expect(canShare).toHaveBeenCalledWith(merged)
  expect(share).toHaveBeenCalledTimes(1)
  expect(share).toHaveBeenCalledWith(merged)
})

it('useShare falls back to the hook options when called without overrides', async () => {
  const { share } = stubShareableNavigator()
  const { result } = await renderHook(() => useShare({ title: 'Hello', text: 'Hello my friend!' }))

  await result.current.share()

  expect(share).toHaveBeenCalledWith({ title: 'Hello', text: 'Hello my friend!' })
})

it('useShare skips navigator.share when canShare rejects the data', async () => {
  const { share, canShare } = stubShareableNavigator(false)
  const { result } = await renderHook(() => useShare({ text: 'blocked' }))

  await expect(result.current.share()).resolves.toBeUndefined()

  expect(canShare).toHaveBeenCalledWith({ text: 'blocked' })
  expect(share).not.toHaveBeenCalled()
})

it('useShare returns the navigator.share promise on the resolve path', async () => {
  let resolveShare: (() => void) | undefined
  const share = vi.fn(() => new Promise<void>((resolve) => {
    resolveShare = resolve
  }))
  stubNavigatorMember('share', share)
  stubNavigatorMember('canShare', () => true)

  const { result } = await renderHook(() => useShare({ text: 'hello' }))

  const pending = result.current.share()
  resolveShare?.()
  await expect(pending).resolves.toBeUndefined()
  expect(share).toHaveBeenCalledTimes(1)
})

it('useShare propagates navigator.share rejections without swallowing AbortError', async () => {
  const abortError = new DOMException('The user aborted a request.', 'AbortError')
  const share = vi.fn(() => Promise.reject(abortError))
  stubNavigatorMember('share', share)
  stubNavigatorMember('canShare', () => true)

  const { result } = await renderHook(() => useShare({ text: 'hello' }))

  await expect(result.current.share()).rejects.toBe(abortError)
})

it('useShare accepts a custom navigator option', async () => {
  const share = vi.fn(() => Promise.resolve())
  const canShare = vi.fn(() => true)
  const nav = { canShare, share } as unknown as Navigator

  const { result } = await renderHook(() => useShare({ text: 'custom' }, { navigator: nav }))

  expect(result.current.isSupported).toBe(true)

  await result.current.share()

  expect(canShare).toHaveBeenCalledWith({ text: 'custom' })
  expect(share).toHaveBeenCalledWith({ text: 'custom' })
})

it('useShare keeps share stable across rerenders and reads the latest options', async () => {
  const { share } = stubShareableNavigator()
  const { result, rerender } = await renderHook((props?: { text?: string }) => useShare({ text: props?.text }))

  const initialShare = result.current.share
  await rerender({ text: 'updated' })

  expect(result.current.share).toBe(initialShare)

  await result.current.share()
  expect(share).toHaveBeenCalledWith({ text: 'updated' })
})
