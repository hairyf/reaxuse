import type { QRCodeToDataURLOptions } from 'qrcode'
import { useMemo, useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { useQRCode } from '../useQRCode'

const DATA_URL_PREFIX = /^data:image\/png;base64,/
const TEXT = 'https://vueuse.org'

// upstream has no `index.test.ts` — these tests are authored for the port and
// wrap the real `qrcode` in a spy so "did it encode?" is observable
const { toDataURLMock } = vi.hoisted(() => ({
  toDataURLMock: vi.fn<(text: string, options?: QRCodeToDataURLOptions) => Promise<string>>(),
}))

vi.mock('qrcode', async (importOriginal) => {
  const actual = await importOriginal<typeof import('qrcode')>()
  return {
    ...actual,
    toDataURL: toDataURLMock,
  }
})

function QrCodeDemo() {
  const [text, setText] = useState(TEXT)
  // memoized — a fresh literal each render would re-encode on every render
  const options = useMemo(() => ({ width: 128, margin: 1 }), [])
  const qrcode = useQRCode(text, options)

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={event => setText(event.target.value)}
      >
      </input>
      {text && qrcode
        ? <img src={qrcode} alt="QR Code"></img>
        : null}
    </div>
  )
}

describe('useQRCode', () => {
  let actualToDataURL: typeof import('qrcode').toDataURL

  beforeEach(async () => {
    const actual = await vi.importActual<typeof import('qrcode')>('qrcode')
    actualToDataURL = actual.toDataURL
    toDataURLMock.mockReset()
    toDataURLMock.mockImplementation(actualToDataURL)
  })

  it('should be defined', () => {
    expect(useQRCode).toBeTypeOf('function')
  })

  it('returns an empty string and never encodes empty text', async () => {
    const { result } = await renderHook(() => useQRCode(''))

    await new Promise(resolve => setTimeout(resolve, 50))

    expect(result.current).toBe('')
    expect(toDataURLMock).not.toHaveBeenCalled()
  })

  it('encodes plain string text into a PNG data URL', async () => {
    const { result } = await renderHook(() => useQRCode(TEXT))

    await expect.poll(() => result.current).toMatch(DATA_URL_PREFIX)
    expect(result.current).toBe(await actualToDataURL(TEXT))
    expect(toDataURLMock).toHaveBeenCalledWith(TEXT, undefined)
  })

  it('follows a changed text prop', async () => {
    const { result, rerender } = await renderHook(
      ({ text }: { text: string } = { text: TEXT }) => useQRCode(text),
      { initialProps: { text: TEXT } },
    )

    await expect.poll(() => result.current).toMatch(DATA_URL_PREFIX)

    await rerender({ text: 'hello' })

    await expect.poll(() => result.current).toBe(await actualToDataURL('hello'))
  })

  it('keeps the previous data URL when the text becomes empty (upstream parity)', async () => {
    const { result, rerender } = await renderHook(
      ({ text }: { text: string } = { text: TEXT }) => useQRCode(text),
      { initialProps: { text: TEXT } },
    )

    await expect.poll(() => result.current).toMatch(DATA_URL_PREFIX)
    const encoded = result.current

    await rerender({ text: '' })
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(result.current).toBe(encoded)
  })

  it('re-encodes on text change and ignores the stale pending promise', async () => {
    const deferred = new Map<string, (url: string) => void>()
    toDataURLMock.mockImplementation((text: string) => new Promise<string>((resolve) => {
      deferred.set(text, resolve)
    }))

    const { result, rerender } = await renderHook(
      ({ text }: { text: string } = { text: 'first' }) => useQRCode(text),
      { initialProps: { text: 'first' } },
    )

    await vi.waitFor(() => expect(deferred.has('first')).toBe(true))

    await rerender({ text: 'second' })
    await vi.waitFor(() => expect(deferred.has('second')).toBe(true))

    expect(result.current).toBe('')

    const resolveFirst = deferred.get('first')
    const resolveSecond = deferred.get('second')

    // the newer encode settles first, then the stale one arrives late
    resolveSecond?.('data:second')
    await expect.poll(() => result.current).toBe('data:second')

    resolveFirst?.('data:first')
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(result.current).toBe('data:second')
  })

  it('forwards options and re-encodes when the options object changes', async () => {
    const options: QRCodeToDataURLOptions = { width: 128, margin: 1 }
    const nextOptions: QRCodeToDataURLOptions = { width: 256, margin: 4 }
    const { result, rerender } = await renderHook(
      ({ opts }: { opts: QRCodeToDataURLOptions } = { opts: options }) => useQRCode(TEXT, opts),
      { initialProps: { opts: options } },
    )

    await expect.poll(() => result.current).toMatch(DATA_URL_PREFIX)

    expect(toDataURLMock).toHaveBeenCalledWith(TEXT, options)
    expect(result.current).toBe(await actualToDataURL(TEXT, options))
    // a custom width really changes the rendered PNG payload
    expect(result.current).not.toBe(await actualToDataURL(TEXT))

    await rerender({ opts: nextOptions })

    await expect.poll(() => result.current).toBe(await actualToDataURL(TEXT, nextOptions))
    expect(toDataURLMock).toHaveBeenCalledWith(TEXT, nextOptions)
  })

  it('does not update state after unmount while an encode is pending', async () => {
    const resolvers: Array<(url: string) => void> = []
    toDataURLMock.mockImplementation(() => new Promise<string>((resolve) => {
      resolvers.push(resolve)
    }))

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      const { result, rerender, unmount } = await renderHook(
        ({ text }: { text: string } = { text: 'first' }) => useQRCode(text),
        { initialProps: { text: 'first' } },
      )

      await vi.waitFor(() => expect(resolvers).toHaveLength(1))

      await rerender({ text: 'second' })
      await vi.waitFor(() => expect(resolvers).toHaveLength(2))

      await unmount()

      resolvers[1]?.('data:second')
      resolvers[0]?.('data:first')
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(result.current).toBe('')
      expect(consoleError).not.toHaveBeenCalled()
    }
    finally {
      consoleError.mockRestore()
    }
  })

  it('renders the data URL into an <img> and refreshes it on input (upstream demo)', async () => {
    const screen = await render(<QrCodeDemo />)
    const image = screen.getByAltText('QR Code')

    await vi.waitFor(() => expect(image.element().getAttribute('src')).toMatch(DATA_URL_PREFIX))
    const first = image.element().getAttribute('src')

    await screen.getByRole('textbox').fill('hello')

    await vi.waitFor(() => {
      const next = image.element().getAttribute('src')
      expect(next).toMatch(DATA_URL_PREFIX)
      expect(next).not.toBe(first)
    })
  })
})
