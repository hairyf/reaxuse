import type { MaybeRefOrGetter } from '@reaxuse/shared'
import { toValue } from '@reaxuse/shared'
import { useEffect, useState } from 'react'

/**
 * React port of VueUse's `useObjectUrl`.
 *
 * Map from @vueuse/core `useObjectUrl`
 * (`source/vueuse/packages/core/useObjectUrl/`). Reactive URL representing an
 * object — creates a URL for the provided `File`, `Blob`, or `MediaSource`
 * via [URL.createObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)
 * and automatically releases it via
 * [URL.revokeObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL)
 * when the source changes or the component unmounts.
 *
 * React divergences:
 * - upstream's `shallowRef` behind a `shallowReadonly` becomes a plain
 *   `string | undefined` value — this hook is purely derived, with no
 *   setters, so passing the object directly (React state) is the recommended
 *   usage;
 * - upstream watches its `MaybeRefOrGetter` source with a Vue watcher and
 *   releases the URL on every change; here the object is resolved during
 *   render (`toValue`) and a `useEffect` keyed on the resolved value creates
 *   the new URL and revokes the previous one. A getter is re-resolved on each
 *   render, and a ref-like `{ current }` object is read every render too, so
 *   the URL re-creates whenever the component re-renders with a new `current`;
 * - unmount revocation happens in the effect cleanup (upstream:
 *   `tryOnScopeDispose`);
 * - SSR-safe: the URL is only ever created inside an effect (effects don't
 *   run on the server), and the effect bails out when `URL.createObjectURL`
 *   is unavailable.
 *
 * @see https://vueuse.org/core/useObjectUrl
 *
 * @example
 * const [file, setFile] = useState<File>()
 * const url = useObjectUrl(file)
 * // `url` is `undefined` until a file is set; a new `blob:` URL is created
 * // and the previous one revoked whenever `file` changes or the component
 * // unmounts
 */
export function useObjectUrl(object: MaybeRefOrGetter<Blob | MediaSource | null | undefined>): string | undefined {
  const [url, setUrl] = useState<string | undefined>()

  // resolve the object during render so the effect below re-creates the URL
  // whenever the resolved object changes (upstream's watch source)
  const resolvedObject = toValue(object)

  useEffect(() => {
    if (!resolvedObject) {
      setUrl(undefined)
      return
    }

    if (typeof URL === 'undefined' || !URL.createObjectURL)
      return

    const next = URL.createObjectURL(resolvedObject)
    setUrl(next)

    // release the URL when the object changes or the component unmounts
    // (upstream: the watcher re-releases on change, `tryOnScopeDispose` on
    // unmount)
    return () => {
      URL.revokeObjectURL(next)
    }
  }, [resolvedObject])

  return url
}
