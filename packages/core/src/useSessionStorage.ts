import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Custom data serialization.
 */
export interface Serializer<T> {
  read: (raw: string) => T
  write: (value: T) => string
}

/**
 * Options captured from upstream's `UseStorageOptions` — only the parts that
 * translate to a self-contained React hook. Vue reactivity options (`flush`,
 * `deep`, `eventFilter`, `shallow`, `initOnMounted`) have no equivalent and
 * are omitted; see the hook's divergences notes.
 */
export interface UseSessionStorageOptions<T> {
  /**
   * Specify a custom `window` instance, e.g. working with iframes or in
   * testing environments.
   */
  window?: Window

  /**
   * Listen to `storage` events on `window` to pick up same-document writes
   * from other hook instances sharing the same key.
   *
   * @default true
   */
  listenToStorageChanges?: boolean

  /**
   * Write the default value to the storage when it does not exist.
   *
   * @default true
   */
  writeDefaults?: boolean

  /**
   * Merge the default value with the value read from the storage.
   *
   * When setting it to `true`, it will perform a **shallow merge** for
   * objects. You can pass a function to perform a custom merge, for example:
   *
   * @default false
   */
  mergeDefaults?: boolean | ((storageValue: T, defaults: T) => T)

  /**
   * Custom data serialization. Defaults are selected per type: strings stay
   * raw, `boolean`/`number` via `String()`, objects via JSON, `Map`/`Set` via
   * JSON entries, `Date` via ISO string.
   */
  serializer?: Serializer<T>

  /**
   * On error callback.
   *
   * @default (error) => console.error(error)
   */
  onError?: (error: unknown) => void
}

export type UseSessionStorageReturn<T> = [
  value: T | null,
  setValue: Dispatch<SetStateAction<T | null>>,
]

type SerializerType = 'boolean' | 'object' | 'number' | 'any' | 'string' | 'map' | 'set' | 'date'

/**
 * Kept internal — upstream exports `StorageSerializers` from `useStorage`,
 * which is tracked separately (#215). Serialization stays an implementation
 * detail here until that hook is ported.
 */
const storageSerializers: Record<SerializerType, Serializer<any>> = {
  boolean: {
    read: (v: any) => v === 'true',
    write: (v: any) => String(v),
  },
  object: {
    read: (v: any) => JSON.parse(v),
    write: (v: any) => JSON.stringify(v),
  },
  number: {
    read: (v: any) => Number.parseFloat(v),
    write: (v: any) => String(v),
  },
  any: {
    read: (v: any) => v,
    write: (v: any) => String(v),
  },
  string: {
    read: (v: any) => v,
    write: (v: any) => String(v),
  },
  map: {
    read: (v: any) => new Map(JSON.parse(v)),
    write: (v: any) => JSON.stringify(Array.from((v as Map<any, any>).entries())),
  },
  set: {
    read: (v: any) => new Set(JSON.parse(v)),
    write: (v: any) => JSON.stringify(Array.from(v as Set<any>)),
  },
  date: {
    read: (v: any) => new Date(v),
    write: (v: any) => v.toISOString(),
  },
}

function guessSerializerType<T extends (string | number | boolean | object | null)>(rawInit: T): SerializerType {
  return rawInit == null
    ? 'any'
    : rawInit instanceof Set
      ? 'set'
      : rawInit instanceof Map
        ? 'map'
        : rawInit instanceof Date
          ? 'date'
          : typeof rawInit === 'boolean'
            ? 'boolean'
            : typeof rawInit === 'string'
              ? 'string'
              : typeof rawInit === 'object'
                ? 'object'
                : !Number.isNaN(rawInit)
                    ? 'number'
                    : 'any'
}

function resolveWindow<T>(options: UseSessionStorageOptions<T>): Window | undefined {
  return options.window ?? (typeof window === 'undefined' ? undefined : window)
}

function defaultOnError(error: unknown): void {
  console.error(error)
}

export function useSessionStorage(key: string, initialValue: string, options?: UseSessionStorageOptions<string>): UseSessionStorageReturn<string>
export function useSessionStorage(key: string, initialValue: boolean, options?: UseSessionStorageOptions<boolean>): UseSessionStorageReturn<boolean>
export function useSessionStorage(key: string, initialValue: number, options?: UseSessionStorageOptions<number>): UseSessionStorageReturn<number>
export function useSessionStorage<T>(key: string, initialValue: T | (() => T), options?: UseSessionStorageOptions<T>): UseSessionStorageReturn<T>
export function useSessionStorage<T = unknown>(key: string, initialValue: null, options?: UseSessionStorageOptions<T>): UseSessionStorageReturn<T>

/**
 * React port of VueUse's `useSessionStorage`.
 *
 * Map from @vueuse/core `useSessionStorage`
 * (`source/vueuse/packages/core/useSessionStorage/`), which is a thin wrapper
 * over `useStorage` bound to `window.sessionStorage`. Reactive
 * [SessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) —
 * the value is persisted under `key` and re-read on mount and key change.
 *
 * Upstream issue #215 tracks the `useStorage` port; until it lands this hook
 * is **self-contained** and mirrors upstream's `useStorage` semantics
 * directly against `sessionStorage` (type-guessed serializer,
 * write-defaults, `mergeDefaults`, same-document sync through synthetic
 * `storage` events). Once `useStorage` exists it can be refactored into the
 * same thin wrapper.
 *
 * React divergences:
 * - the Vue `RemovableRef<T>` return becomes a `useState`-backed tuple;
 *   `setValue(null)` removes the entry from storage and the state falls back
 *   to the initial value (mirroring upstream, where the self storage event
 *   restores `rawInit`);
 * - storage is never touched during render: the first read happens in the
 *   mount effect (SSR-safe — the server renders `initialValue`);
 * - `key` is a plain React string; changing it between renders re-reads the
 *   new key (upstream takes a reactive `MaybeRefOrGetter` key). Writes always
 *   go to the key of the current render, and when `writeDefaults` is on, the
 *   new key is seeded with the initial value when absent — matching upstream;
 * - a function `initialValue` is a lazy initializer (React `useState`
 *   convention, equivalent to upstream's getter support);
 * - options are captured once at mount, mirroring upstream's one-time
 *   destructuring;
 * - Vue reactivity options have no equivalent here: `flush`/`deep`/
 *   `eventFilter` (writes happen synchronously inside `setValue`), `shallow`
 *   (React state is replaced wholesale) and `initOnMounted` (effectively
 *   always on — the first read happens in the mount effect) are omitted.
 *
 * @example
 * const [state, setState] = useSessionStorage('my-store', { hello: 'hi', greeting: 'Hello' })
 * const [flag, setFlag] = useSessionStorage('my-flag', true)
 *
 * setState(null) // delete data from storage
 */
export function useSessionStorage<T extends (string | number | boolean | object | null)>(
  key: string,
  initialValue: T | (() => T),
  options: UseSessionStorageOptions<T> = {},
): UseSessionStorageReturn<T> {
  // captured once at mount — mirrors upstream's one-time options destructuring
  const optionsRef = useRef(options)

  const [state, setState] = useState<T | null>(initialValue)
  // latest committed value — lets the stable setter support function updaters
  // and lets storage-event handling suppress self-echoes (mirrors upstream's
  // pausable watch + `serializer.write(data.value)` comparison)
  const stateRef = useRef<T | null>(state)
  // upstream resolves `defaults` once at setup; frozen here the same way
  const rawInitRef = useRef<{ value: T | null } | undefined>(undefined)
  rawInitRef.current ??= { value: state }

  const setInternal = useCallback((next: T | null) => {
    stateRef.current = next
    setState(next)
  }, [])

  const getStorage = useCallback((): Storage | undefined => {
    return resolveWindow(optionsRef.current)?.sessionStorage
  }, [])

  const getSerializer = useCallback((): Serializer<T> => {
    return optionsRef.current.serializer ?? storageSerializers[guessSerializerType(rawInitRef.current!.value)]
  }, [])

  const dispatchWriteEvent = useCallback((oldValue: string | null, newValue: string | null) => {
    const win = resolveWindow(optionsRef.current)
    if (!win)
      return
    // synthetic StorageEvent — same-document sync for other hook instances
    // sharing the key (real StorageEvent-init payload, mirroring upstream)
    win.dispatchEvent(new StorageEvent('storage', {
      key,
      oldValue,
      newValue,
      storageArea: getStorage() as Storage,
    }))
  }, [key, getStorage])

  const write = useCallback((value: T | null) => {
    const storage = getStorage()
    if (!storage)
      return
    const { onError = defaultOnError } = optionsRef.current
    try {
      const oldValue = storage.getItem(key)

      if (value == null) {
        dispatchWriteEvent(oldValue, null)
        storage.removeItem(key)
      }
      else {
        const serialized = getSerializer().write(value)
        if (oldValue !== serialized) {
          storage.setItem(key, serialized)
          dispatchWriteEvent(oldValue, serialized)
        }
      }
    }
    catch (error) {
      onError(error)
    }
  }, [key, getStorage, getSerializer, dispatchWriteEvent])

  const read = useCallback((event?: StorageEvent): T | null => {
    const storage = getStorage()!
    const rawInit = rawInitRef.current!.value
    const { mergeDefaults = false, writeDefaults = true } = optionsRef.current
    const rawValue = event
      ? event.newValue
      : storage.getItem(key)

    if (rawValue == null) {
      if (writeDefaults && rawInit != null)
        storage.setItem(key, getSerializer().write(rawInit))
      return rawInit
    }
    else if (!event && mergeDefaults) {
      const value = getSerializer().read(rawValue)
      if (typeof mergeDefaults === 'function')
        return mergeDefaults(value, rawInit as T)
      else if (guessSerializerType(rawInit) === 'object' && !Array.isArray(value))
        return { ...(rawInit as Record<string, unknown>), ...(value as Record<string, unknown>) } as T
      return value
    }
    else if (typeof rawValue !== 'string') {
      return rawValue as T
    }
    else {
      return getSerializer().read(rawValue)
    }
  }, [key, getStorage, getSerializer])

  const setValue = useCallback((value: SetStateAction<T | null>) => {
    const next = typeof value === 'function'
      ? (value as (prev: T | null) => T | null)(stateRef.current)
      : value
    setInternal(next)
    write(next)
  }, [setInternal, write])

  // initial read + re-read on key change (SSR-safe: effects never run on the
  // server, so the first render always shows `initialValue`)
  useEffect(() => {
    const storage = getStorage()
    if (!storage)
      return
    setInternal(read())
  }, [getStorage, read, setInternal])

  useEffect(() => {
    const win = resolveWindow(optionsRef.current)
    const storage = getStorage()
    const { listenToStorageChanges = true } = optionsRef.current
    if (!win || !storage || !listenToStorageChanges)
      return

    const onStorageEvent = (event: StorageEvent): void => {
      if (event.storageArea !== storage)
        return

      if (event.key == null) {
        // storage cleared — reset to the initial value (mirrors upstream)
        setInternal(rawInitRef.current!.value)
        return
      }

      if (event.key !== key)
        return

      const { onError = defaultOnError } = optionsRef.current
      try {
        const serializedData = getSerializer().write(stateRef.current as T)
        if (event.newValue !== serializedData)
          setInternal(read(event))
      }
      catch (error) {
        onError(error)
      }
    }

    win.addEventListener('storage', onStorageEvent, { passive: true })

    return () => {
      win.removeEventListener('storage', onStorageEvent)
    }
  }, [key, getStorage, getSerializer, read, setInternal])

  return [state, setValue] as UseSessionStorageReturn<T>
}
