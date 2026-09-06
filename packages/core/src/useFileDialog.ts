import type { MaybeRefOrGetter } from '@reaxuse/shared'
import { hasOwn, toValue } from '@reaxuse/shared'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseFileDialogOptions {
  /**
   * A custom `document` instance, e.g. working with iframes or in testing
   * environments. Inlined here — `ConfigurableDocument` is not ported to
   * `@reaxuse/shared`, so `document?` mirrors the option `useTitle` exposes
   * (defaults to the global `document` when not provided).
   */
  document?: Document | null
  /**
   * @default true
   */
  multiple?: MaybeRefOrGetter<boolean>
  /**
   * @default '*'
   */
  accept?: MaybeRefOrGetter<string>
  /**
   * Select the input source for the capture file.
   * @see [HTMLInputElement Capture](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture)
   */
  capture?: MaybeRefOrGetter<string>
  /**
   * Reset when open file dialog.
   * @default false
   */
  reset?: MaybeRefOrGetter<boolean>
  /**
   * Select directories instead of files.
   * @see [HTMLInputElement webkitdirectory](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory)
   * @default false
   */
  directory?: MaybeRefOrGetter<boolean>

  /**
   * Initial files to set.
   * @default null
   */
  initialFiles?: Array<File> | FileList

  /**
   * The input element to use for file dialog.
   * @default document.createElement('input')
   */
  input?: MaybeRefOrGetter<HTMLInputElement | null>
}

const DEFAULT_OPTIONS = {
  multiple: true,
  accept: '*',
  reset: false,
  directory: false,
} satisfies UseFileDialogOptions

export interface UseFileDialogReturn {
  files: FileList | null
  open: (localOptions?: Partial<UseFileDialogOptions>) => void
  reset: () => void
  onChange: (fn: (files: FileList | null) => void) => { off: () => void }
  onCancel: (fn: () => void) => { off: () => void }
}

function prepareInitialFiles(files: UseFileDialogOptions['initialFiles']): FileList | null {
  if (!files)
    return null

  if (files instanceof FileList)
    return files

  const dt = new DataTransfer()
  for (const file of files) {
    dt.items.add(file)
  }

  return dt.files
}

/**
 * React port of VueUse's `useFileDialog`.
 *
 * Map from @vueuse/core `useFileDialog`
 * (`source/vueuse/packages/core/useFileDialog/`). Open file dialog with ease.
 *
 * The hook drives a hidden `<input type="file">` (created on mount unless a
 * custom `input` element is provided) and exposes `open` / `reset` / `files`
 * plus `onChange` / `onCancel` event hooks.
 *
 * React divergences:
 * - the Vue `files` shallowRef becomes plain state (`FileList | null`, no
 *   `.value`); `initialFiles` is read once at mount, like upstream setup;
 * - upstream's `createEventHook()` on* members become stable subscribe
 *   functions with the same `(fn) => { off }` shape, managed with Sets, so
 *   they are identity-stable across renders and compatible with the
 *   `useListener` protocol;
 * - the input element is resolved and wired in a mount effect instead of a
 *   `computed`, so nothing touches the DOM during render (SSR-safe);
 * - upstream's `watchEffect(() => applyOptions(options))` becomes an effect
 *   re-applying `multiple` / `accept` / `directory` / `capture` to the input
 *   whenever the (unwrapped) option values change across renders — mutate a
 *   ref-like source's `.current` and re-render to mirror `watchEffect` on a
 *   Vue ref;
 * - the event subscriptions are cleared on unmount (upstream:
 *   `tryOnScopeDispose` inside `createEventHook`'s `on`).
 *
 * @example
 * const { files, open, reset, onChange, onCancel } = useFileDialog({ accept: 'image/*' })
 *
 * useListener(onChange, (files) => {
 *   // do something with files
 * })
 *
 * useListener(onCancel, () => {
 *   // do something on cancel
 * })
 */
export function useFileDialog(options: UseFileDialogOptions = {}): UseFileDialogReturn {
  // Latest-options mirror: `open()` stays identity-stable while always using
  // the current render's options.
  const optionsRef = useRef(options)
  optionsRef.current = options

  const [files, setFiles] = useState<FileList | null>(() => prepareInitialFiles(options.initialFiles))

  // Event hooks: upstream `createEventHook()` — one stable subscribe
  // function per event, returning an `off` handle to unsubscribe. The sets
  // are stored in refs so the subscribe functions stay identity-stable.
  const changeFns = useRef(new Set<(files: FileList | null) => void>())
  const cancelFns = useRef(new Set<() => void>())

  const onChange = useCallback((fn: (files: FileList | null) => void) => {
    changeFns.current.add(fn)
    return {
      off: () => {
        changeFns.current.delete(fn)
      },
    }
  }, [])

  const onCancel = useCallback((fn: () => void) => {
    cancelFns.current.add(fn)
    return {
      off: () => {
        cancelFns.current.delete(fn)
      },
    }
  }, [])

  const changeTrigger = useCallback((nextFiles: FileList | null) => {
    Array.from(changeFns.current).forEach(fn => fn(nextFiles))
  }, [])

  const cancelTrigger = useCallback(() => {
    Array.from(cancelFns.current).forEach(fn => fn())
  }, [])

  const resolvedInput = toValue(options.input)
  const customDocument = options.document ?? (typeof document === 'undefined' ? null : document)

  // Resolve the input element (custom `input` option or a newly created one)
  // and wire the change / cancel events — upstream's `inputRef` computed,
  // moved into an effect so nothing touches the DOM during render.
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const input = resolvedInput ?? (customDocument ? customDocument.createElement('input') : null)
    if (!input)
      return

    inputRef.current = input
    input.type = 'file'

    input.onchange = (event: Event) => {
      const result = event.target as HTMLInputElement
      setFiles(result.files)
      changeTrigger(result.files)
    }

    input.oncancel = () => {
      cancelTrigger()
    }

    return () => {
      input.onchange = null
      input.oncancel = null
      if (inputRef.current === input)
        inputRef.current = null
    }
  }, [resolvedInput, customDocument, changeTrigger, cancelTrigger, setFiles])

  // Unmount cleanup of the event subscriptions (upstream: `tryOnScopeDispose`
  // inside createEventHook's `on`).
  useEffect(() => {
    return () => {
      changeFns.current.clear()
      cancelFns.current.clear()
    }
  }, [])

  const applyOptions = useCallback((opts: UseFileDialogOptions) => {
    const el = inputRef.current
    if (!el)
      return
    el.multiple = toValue(opts.multiple)!
    el.accept = toValue(opts.accept)!
    // webkitdirectory key is not stabled, maybe replaced in the future.
    el.webkitdirectory = toValue(opts.directory)!
    if (hasOwn(opts, 'capture'))
      el.capture = toValue(opts.capture)!
  }, [])

  // Unwrapped option values so the effect re-applies when a ref-like source's
  // `.current` changes across a re-render (upstream: `watchEffect`).
  const multiple = toValue(options.multiple)
  const accept = toValue(options.accept)
  const capture = toValue(options.capture)
  const directory = toValue(options.directory)

  // React analog of upstream's `watchEffect(() => applyOptions(options))`.
  useEffect(() => {
    const el = inputRef.current
    if (!el)
      return
    el.multiple = multiple!
    el.accept = accept!
    el.webkitdirectory = directory!
    if (hasOwn(options, 'capture'))
      el.capture = capture!
  }, [multiple, accept, capture, directory, options])

  const reset = useCallback(() => {
    setFiles(null)
    const input = inputRef.current
    if (input && input.value) {
      input.value = ''
      changeTrigger(null)
    }
  }, [changeTrigger])

  const open = useCallback((localOptions?: Partial<UseFileDialogOptions>) => {
    const el = inputRef.current
    if (!el)
      return
    const mergedOptions: UseFileDialogOptions = {
      ...DEFAULT_OPTIONS,
      ...optionsRef.current,
      ...localOptions,
    }
    applyOptions(mergedOptions)
    if (toValue(mergedOptions.reset))
      reset()
    el.click()
  }, [applyOptions, reset])

  return {
    files,
    open,
    reset,
    onChange,
    onCancel,
  }
}
