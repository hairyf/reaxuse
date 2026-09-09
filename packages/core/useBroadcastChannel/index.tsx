import type { ConfigurableWindow } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSupported } from '../useSupported'

export interface UseBroadcastChannelOptions extends ConfigurableWindow {
  /**
   * The name of the channel.
   */
  name: string
}

export interface UseBroadcastChannelReturn<D, P> {
  /**
   * Whether the `BroadcastChannel` API is supported by the browser.
   */
  isSupported: boolean

  /**
   * The current `BroadcastChannel` instance; `undefined` before the mount
   * effect creates it (SSR) or after `close()`.
   */
  channel: BroadcastChannel | undefined

  /**
   * Latest data received via the channel's `message` event.
   */
  data: D | undefined

  /**
   * Send a message to the channel.
   */
  post: (data: P) => void

  /**
   * Close the channel and release the `channel` reference.
   */
  close: () => void

  /**
   * The latest `messageerror` event, or `null` when none occurred.
   */
  error: Event | null

  /**
   * Register a callback fired on every `message` event — `useListener`
   * protocol `(fn) => { off }`.
   */
  onMessage: (fn: (event: MessageEvent<D>) => void) => { off: () => void }

  /**
   * Register a callback fired on every `messageerror` event — `useListener`
   * protocol `(fn) => { off }`.
   */
  onMessageError: (fn: (event: MessageEvent) => void) => { off: () => void }
}

/**
 * Reactive [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel).
 *
 * Map from @vueuse/core `useBroadcastChannel`
 * (`source/vueuse/packages/core/useBroadcastChannel/`), a reactive wrapper
 * around the browser `BroadcastChannel` API: it opens a named channel, exposes
 * the current instance, the latest received message, `post` / `close`
 * shortcuts, a `messageerror` error state and listener registration functions,
 * and closes the channel automatically on unmount.
 *
 * React divergences:
 * - the Vue `ShallowRef` returns become plain state: `channel`, `data` and
 *   `error` are `useState` values, updated when a message / error arrives or
 *   the channel is created;
 * - the channel is created in a mount `useEffect` gated by `useSupported`
 *   (upstream: a `tryOnMounted` setup block behind `if (isSupported.value)`),
 *   so SSR renders the initial `undefined`/`null` values without ever touching
 *   `BroadcastChannel` — SSR-safe;
 * - upstream's internal `useEventListener` message listeners become the
 *   `onMessage` / `onMessageError` registration functions in the return
 *   (`(fn) => { off }`, `useListener` protocol); `data` / `error` are still
 *   updated from the same native listeners;
 * - upstream's `isClosed` flag is dropped: `close()` closes the channel and
 *   releases the reference (`channel` → `undefined`), so a closed channel is
 *   observable and `post()` becomes a no-op after closing (upstream keeps the
 *   closed instance and throws on `postMessage`).
 *
 * @example
 * const { isSupported, channel, data, post, close, error, onMessage } = useBroadcastChannel({ name: 'my-channel' })
 *
 * post('Hello, World!')
 * close()
 *
 * @see https://vueuse.org/core/useBroadcastChannel/
 */
export function useBroadcastChannel<D, P>(options: UseBroadcastChannelOptions): UseBroadcastChannelReturn<D, P> {
  // captured once at mount — mirrors upstream's one-time options destructuring
  const optionsRef = useRef(options)

  const win = optionsRef.current.window ?? (typeof window === 'undefined' ? undefined : window)
  const isSupported = useSupported(() => win && 'BroadcastChannel' in win)

  const [channel, setChannel] = useState<BroadcastChannel | undefined>(undefined)
  const [data, setData] = useState<D | undefined>(undefined)
  const [error, setError] = useState<Event | null>(null)

  // latest channel read by the stable `post` / `close` callbacks (upstream:
  // the `channel` ref)
  const channelRef = useRef<BroadcastChannel | undefined>(undefined)

  // `onMessage` / `onMessageError` — `useListener`-style registration
  // functions fired from the native `message` / `messageerror` listeners.
  const messageFns = useRef(new Set<(event: MessageEvent<D>) => void>())
  const messageErrorFns = useRef(new Set<(event: MessageEvent) => void>())

  const onMessage = useCallback((fn: (event: MessageEvent<D>) => void) => {
    messageFns.current.add(fn)
    return {
      off: () => {
        messageFns.current.delete(fn)
      },
    }
  }, [])

  const onMessageError = useCallback((fn: (event: MessageEvent) => void) => {
    messageErrorFns.current.add(fn)
    return {
      off: () => {
        messageErrorFns.current.delete(fn)
      },
    }
  }, [])

  const post = useCallback((value: P) => {
    channelRef.current?.postMessage(value)
  }, [])

  const close = useCallback(() => {
    const current = channelRef.current
    if (current) {
      current.close()
      channelRef.current = undefined
      setChannel(undefined)
    }
  }, [])

  // upstream: `if (isSupported.value)` setup block + `tryOnScopeDispose(close)`
  // (→ close on unmount)
  useEffect(() => {
    if (!isSupported)
      return

    const { name } = optionsRef.current
    const broadcastChannel = new BroadcastChannel(name)
    channelRef.current = broadcastChannel
    setChannel(broadcastChannel)
    setError(null)

    const onMessageEvent = (event: MessageEvent) => {
      setData(event.data as D)
      Array.from(messageFns.current).forEach(fn => fn(event as MessageEvent<D>))
    }

    const onMessageErrorEvent = (event: MessageEvent) => {
      setError(event)
      Array.from(messageErrorFns.current).forEach(fn => fn(event))
    }

    broadcastChannel.addEventListener('message', onMessageEvent, { passive: true })
    broadcastChannel.addEventListener('messageerror', onMessageErrorEvent, { passive: true })

    return () => {
      broadcastChannel.removeEventListener('message', onMessageEvent)
      broadcastChannel.removeEventListener('messageerror', onMessageErrorEvent)
      if (channelRef.current === broadcastChannel)
        channelRef.current = undefined
      broadcastChannel.close()
    }
  }, [isSupported])

  return {
    isSupported,
    channel,
    data,
    post,
    close,
    error,
    onMessage,
    onMessageError,
  }
}
