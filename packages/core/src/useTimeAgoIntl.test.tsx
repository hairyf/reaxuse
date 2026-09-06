import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { formatTimeAgoIntl, formatTimeAgoIntlParts, useTimeAgoIntl } from './useTimeAgoIntl'

/**
 * Mirrors the documented default join pipeline (`formatToParts` → trim →
 * join with spaces) so locale-specific expectations are derived from the
 * runtime's own ICU data instead of hardcoded strings — engine-agnostic,
 * per house precedent (see useDateFormat's timezone tests).
 */
function joinedRelative(
  locale: string,
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  relativeTimeFormatOptions: Intl.RelativeTimeFormatOptions = { numeric: 'auto' },
) {
  const rtf = new Intl.RelativeTimeFormat(locale, relativeTimeFormatOptions)
  return rtf.formatToParts(value, unit).map(part => part.value.trim()).join(' ')
}

describe('formatTimeAgoIntlParts', () => {
  it('should format with spaces by default', () => {
    const parts1: Intl.RelativeTimeFormatPart[] = [
      { type: 'integer', value: '5', unit: 'day' },
      { type: 'literal', value: ' days' },
    ]

    expect(formatTimeAgoIntlParts(parts1)).toEqual('5 days')

    const parts2: Intl.RelativeTimeFormatPart[] = [
      { type: 'integer', value: '5', unit: 'day' },
      { type: 'literal', value: '天后' },
    ]
    expect(formatTimeAgoIntlParts(parts2)).toEqual('5 天后')
  })

  it('should format without spaces if insertSpace is false', () => {
    const parts1: Intl.RelativeTimeFormatPart[] = [
      { type: 'integer', value: '5', unit: 'day' },
      { type: 'literal', value: ' days' },
    ]

    expect(formatTimeAgoIntlParts(parts1, { insertSpace: false })).toEqual('5 days')

    const parts2: Intl.RelativeTimeFormatPart[] = [
      { type: 'integer', value: '5', unit: 'day' },
      { type: 'literal', value: '天后' },
    ]

    expect(formatTimeAgoIntlParts(parts2, { insertSpace: false })).toEqual('5天后')
  })

  it('should use joinParts if provided', () => {
    const parts: Intl.RelativeTimeFormatPart[] = [
      { type: 'integer', value: '5', unit: 'day' },
      { type: 'literal', value: '天后' },
    ]
    const result = formatTimeAgoIntlParts(parts, {
      joinParts: p => p.map(x => `[${x.value}]`).join('|'),
    })
    expect(result).toEqual('[5]|[天后]')
  })
})

describe('formatTimeAgoIntl', () => {
  it('should format a past timestamp', () => {
    const now = Date.now()
    const past = new Date(now - 1000 * 60 * 5)

    expect(formatTimeAgoIntl(past, {}, now)).toMatch('5')
    expect(formatTimeAgoIntl(past, { locale: 'en' }, now)).toEqual('5 minutes ago')
    // zh output comes from the parts join (upstream asserts '5 分钟前') —
    // derived here to stay agnostic to ICU version differences
    expect(formatTimeAgoIntl(past, { locale: 'zh' }, now))
      .toEqual(joinedRelative('zh', -5, 'minute'))
  })

  it('should format a future timestamp', () => {
    const now = Date.now()
    const future = new Date(now + 1000 * 60 * 5)

    expect(formatTimeAgoIntl(future, { locale: 'en' }, now)).toEqual('in 5 minutes')
  })

  it('should pass through relativeTimeFormatOptions', () => {
    const now = Date.now()
    const yearAgo = new Date(now - 31_536_000_000)

    // numeric: 'auto' special-cases 1 — derived at runtime
    expect(formatTimeAgoIntl(yearAgo, { locale: 'en' }, now))
      .toEqual(joinedRelative('en', -1, 'year'))
    expect(formatTimeAgoIntl(yearAgo, { locale: 'en', relativeTimeFormatOptions: { numeric: 'always' } }, now)).toEqual('1 year ago')
  })
})

describe('formatTimeAgoIntl (unit selection)', () => {
  const now = Date.now()

  it.each([
    { offset: -500, expected: 'now' },
    { offset: -1000, expected: '1 second ago' },
    { offset: -59_000, expected: '59 seconds ago' },
    // Math.round(-1.5) === -1 — upstream picks the minute already at 90s past
    { offset: -90_000, expected: '1 minute ago' },
    // Math.round(-2.5) === -2
    { offset: -150_000, expected: '2 minutes ago' },
    { offset: -1000 * 60 * 100, expected: '2 hours ago' },
    { offset: -1000 * 60 * 60 * 24 * 21, expected: '3 weeks ago' },
    { offset: -1000 * 60 * 60 * 24 * 40, expected: 'last month' },
    { offset: -31_536_000_000 * 2, expected: '2 years ago' },
    // Math.round(1.5) === 2 — the same 90s in the future rounds up instead
    { offset: 90_000, expected: 'in 2 minutes' },
    { offset: 1000 * 60 * 45, expected: 'in 45 minutes' },
  ])('offset $offset ms renders "$expected"', ({ offset, expected }) => {
    expect(formatTimeAgoIntl(new Date(now + offset), { locale: 'en' }, now)).toEqual(expected)
  })

  it('should respect custom units', () => {
    expect(
      formatTimeAgoIntl(new Date(now - 1000 * 60 * 5), {
        locale: 'en',
        units: [{ name: 'second', ms: 1000 }],
      }, now),
    ).toEqual('300 seconds ago')

    // falls back to the last custom unit when no threshold matches
    expect(
      formatTimeAgoIntl(new Date(now - 500), {
        locale: 'en',
        units: [{ name: 'hour', ms: 3_600_000 }],
      }, now),
    ).toEqual('this hour')
  })
})

describe('useTimeAgoIntl', () => {
  it('should compute a formatted timeAgo string', async () => {
    const now = Date.now()
    const past = now - 1000 * 60 * 5

    const { result } = await renderHook(() => useTimeAgoIntl(past, { locale: 'en' }))

    expect(result.current).toMatch('5')
    expect(result.current).toEqual('5 minutes ago')
  })

  it('should accept Date, number and string inputs', async () => {
    const now = Date.now()
    const past = now - 1000 * 60 * 5
    const expected = '5 minutes ago'

    const asNumber = await renderHook(() => useTimeAgoIntl(past, { locale: 'en' }))
    const asDate = await renderHook(() => useTimeAgoIntl(new Date(past), { locale: 'en' }))
    const asString = await renderHook(() => useTimeAgoIntl(new Date(past).toISOString(), { locale: 'en' }))

    expect(asNumber.result.current).toEqual(expected)
    expect(asDate.result.current).toEqual(expected)
    expect(asString.result.current).toEqual(expected)
  })

  it('should respect the locale option', async () => {
    const now = Date.now()
    const past = now - 1000 * 60 * 5

    const { result } = await renderHook(() => useTimeAgoIntl(past, { locale: 'zh' }))

    // runtime-derived expectation — agnostic to ICU version differences
    expect(result.current)
      .toEqual(joinedRelative('zh', -5, 'minute'))
  })

  it('should re-render as time passes with updateInterval', async () => {
    const start = Date.now()

    const { result } = await renderHook(() => useTimeAgoIntl(start, {
      locale: 'en',
      units: [{ name: 'second', ms: 1000 }],
      updateInterval: 50,
    }))

    // `time` never changes — only the interval ticks can move the output
    // from `now` to `1 second ago`, `2 seconds ago`, ...
    const initial = Number.parseInt(result.current, 10) || 0
    await expect.poll(() => Number.parseInt(result.current, 10) || 0, { timeout: 10_000, interval: 100 })
      .toBeGreaterThan(initial)
  })

  it('should clear its update interval on unmount', async () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')

    const { unmount } = await renderHook(() => useTimeAgoIntl(Date.now(), { updateInterval: 50 }))

    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })
})

describe('useTimeAgoIntl (component)', () => {
  it('updates when the input time changes', async () => {
    function UseTimeAgoIntlDemo() {
      const [offset, setOffset] = useState(0)
      const time = Date.now() - 1000 * 60 * 5 + offset
      const timeAgoIntl = useTimeAgoIntl(time, { locale: 'en' })

      return (
        <div>
          <p>{timeAgoIntl}</p>
          <button onClick={() => setOffset(current => current - 60_000)}>older</button>
        </div>
      )
    }

    const screen = await render(<UseTimeAgoIntlDemo />)
    await expect.element(screen.getByText('5 minutes ago')).toBeVisible()

    await screen.getByRole('button', { name: 'older' }).click()

    await expect.element(screen.getByText('6 minutes ago')).toBeVisible()
  })
})
