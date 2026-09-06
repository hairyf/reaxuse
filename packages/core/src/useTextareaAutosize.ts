import type { Dispatch, RefObject, SetStateAction } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Options for `useTextareaAutosize`.
 */
export interface UseTextareaAutosizeOptions {
  /**
   * Specify a custom `window` instance, e.g. working with iframes or in
   * testing environments.
   */
  window?: Window
  /**
   * Textarea element to autosize. When omitted, bind the returned `textarea`
   * ref instead.
   */
  element?: RefObject<HTMLTextAreaElement | null>
  /**
   * Textarea content. When omitted, the hook owns the content state and you
   * update it through the returned `setInput`.
   */
  input?: string
  /** Maximum autosized height in pixels. */
  maxHeight?: number
  /**
   * Values that should trigger a textarea resize when they change — the React
   * mapping of upstream's `watch` sources. The resize also fires once on
   * mount (upstream `immediate: true`).
   */
  watch?: unknown[]
  /** Function called when the textarea size changes. */
  onResize?: () => void
  /**
   * Specify style target to apply the height based on textarea content. If
   * not provided it will use textarea itself.
   */
  styleTarget?: RefObject<HTMLElement | null>
  /**
   * Specify the style property that will be used to manipulate height. Can be
   * `height | minHeight`. Default value is `height`.
   */
  styleProp?: 'height' | 'minHeight'
}

export interface UseTextareaAutosizeReturn {
  /**
   * Ref to bind to the `<textarea>` — the `element` option when provided,
   * otherwise a hook-owned ref.
   */
  textarea: RefObject<HTMLTextAreaElement | null>
  /** Current textarea content (the `input` option when provided, otherwise internal state). */
  input: string
  /**
   * Content setter for the hook-owned state. Has no effect on the resize
   * while an `input` option is provided.
   */
  setInput: Dispatch<SetStateAction<string>>
  /** Manually trigger a textarea resize. */
  triggerResize: () => void
}

/**
 * Call window.requestAnimationFrame(), if not available, just call the function
 */
function tryRequestAnimationFrame(window: Window | undefined, fn: () => void) {
  if (window && typeof window.requestAnimationFrame === 'function')
    window.requestAnimationFrame(fn)
  else
    fn()
}

/**
 * React port of VueUse's `useTextareaAutosize`.
 *
 * Map from @vueuse/core `useTextareaAutosize`
 * (`source/vueuse/packages/core/useTextareaAutosize/`) — automatically update
 * the height of a textarea depending on the content.
 *
 * React divergences:
 * - the Vue `textarea` ref return becomes a `RefObject` you bind with
 *   `ref={textarea}`, or pass your own via the `element` option; the Vue
 *   `input` ref becomes a plain `string` + `setInput` state pair, and a
 *   controlled value can be passed with the `input` option instead;
 * - upstream's `watch([input, textarea], () => nextTick(triggerResize), {
 *   immediate: true })` becomes an effect running `triggerResize` after each
 *   content/render commit;
 * - upstream's `watch(options.watch, ...)` sources become a `watch?: unknown[]`
 *   values array, compared structurally between renders;
 * - upstream's `useResizeObserver` composition becomes a self-contained
 *   `ResizeObserver` effect that re-measures when the element's width changes
 *   and is disconnected on unmount.
 *
 * @example
 * const { textarea, input, setInput } = useTextareaAutosize()
 * // <textarea ref={textarea} value={input} onChange={e => setInput(e.target.value)} />
 */
export function useTextareaAutosize(options: UseTextareaAutosizeOptions = {}): UseTextareaAutosizeReturn {
  const {
    element,
    input: inputOption,
    maxHeight,
    onResize,
    styleProp = 'height',
    styleTarget,
    watch,
    window: windowOption,
  } = options

  const [internalInput, setInternalInput] = useState('')
  const input = inputOption ?? internalInput

  const fallbackTextarea = useRef<HTMLTextAreaElement | null>(null)
  const textarea = element ?? fallbackTextarea

  const textareaScrollHeightRef = useRef(1)
  const textareaOldWidthRef = useRef(0)
  const onResizeRef = useRef(onResize)
  onResizeRef.current = onResize

  const triggerResize = useCallback(() => {
    const textareaEl = textarea.current
    if (!textareaEl)
      return

    let height = ''

    textareaEl.style[styleProp] = '1px'
    const scrollHeight = textareaEl.scrollHeight
    const previousScrollHeight = textareaScrollHeightRef.current
    textareaScrollHeightRef.current = scrollHeight
    const styleHeight = maxHeight != null
      ? `${Math.min(scrollHeight, maxHeight)}px`
      : `${scrollHeight}px`

    // If style target is provided update its height
    const target = styleTarget?.current
    if (target)
      target.style[styleProp] = styleHeight
    // else update textarea's height by updating height variable
    else
      height = styleHeight

    textareaEl.style[styleProp] = height

    // upstream: watch(textareaScrollHeight, () => options?.onResize?.())
    if (scrollHeight !== previousScrollHeight)
      onResizeRef.current?.()
  }, [maxHeight, styleProp, styleTarget, textarea])

  // upstream: watch([input, textarea], () => nextTick(triggerResize), { immediate: true })
  useEffect(() => {
    triggerResize()
  }, [input, textarea, triggerResize])

  // upstream: watch(options.watch, triggerResize, { immediate: true, deep: true })
  const watchKey = watch ? JSON.stringify(watch) : ''
  useEffect(() => {
    triggerResize()
  }, [triggerResize, watchKey])

  // upstream: useResizeObserver(textarea, ...) — re-measure when the element's
  // width changes (e.g. responsive layouts)
  useEffect(() => {
    const textareaEl = textarea.current
    const win = windowOption ?? (typeof window === 'undefined' ? undefined : window)
    if (!win || !textareaEl || !('ResizeObserver' in win))
      return

    const observer = new ResizeObserver((entries) => {
      const contentRect = entries[0]?.contentRect
      if (!contentRect || textareaOldWidthRef.current === contentRect.width)
        return

      tryRequestAnimationFrame(win, () => {
        textareaOldWidthRef.current = contentRect.width
        triggerResize()
      })
    })
    observer.observe(textareaEl)

    return () => {
      observer.disconnect()
    }
  }, [textarea, triggerResize, windowOption])

  return {
    textarea,
    input,
    setInput: setInternalInput,
    triggerResize,
  }
}
