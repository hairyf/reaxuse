import type { UseTimeAgoMessages } from './useTimeAgo'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { formatTimeAgo, useTimeAgo } from './useTimeAgo'

// annotated like upstream's DEFAULT_MESSAGES — an inline literal at the
// callsite would infer the builtin keys into UnitNames and intersect
// `past`/`future` into an unusable type
const zhMessages: UseTimeAgoMessages = {
  justNow: '刚才',
  past: n => (/\d/.test(n) ? `${n}前` : n),
  future: n => (/\d/.test(n) ? `${n}后` : n),
  invalid: '',
  second: n => `${n}秒`,
  minute: n => `${n}分钟`,
  hour: n => `${n}小时`,
  day: (n, past) => (n === 1 ? (past ? '昨天' : '明天') : `${n}天`),
  week: (n, past) => (n === 1 ? (past ? '上周' : '下周') : `${n}周`),
  month: (n, past) => (n === 1 ? (past ? '上个月' : '下个月') : `${n}个月`),
  year: (n, past) => (n === 1 ? (past ? '去年' : '明年') : `${n}年`),
}

type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

const UNITS = [
  { max: 60000, value: 1000, name: 'second' },
  { max: 2760000, value: 60000, name: 'minute' },
  { max: 72000000, value: 3600000, name: 'hour' },
  { max: 518400000, value: 86400000, name: 'day' },
  { max: 2419200000, value: 604800000, name: 'week' },
  { max: 28512000000, value: 2592000000, name: 'month' },
  { max: Number.POSITIVE_INFINITY, value: 31536000000, name: 'year' },
]

function fullDateFormatter(value: Date | number | string) {
  return new Date(value).toISOString().slice(0, 10)
}

function getNeededTimeChange(type: TimeUnit, count: number, adjustSecond?: number) {
  const unit = UNITS.find(i => i.name === type)
  return (unit?.value || 0) * count + (adjustSecond || 0) * 1000
}

describe('formatTimeAgo', () => {
  // fixed epoch — `now` is passed explicitly, so expectations are exact
  // (mirrors upstream's fake-timer `baseTime` without vi.useFakeTimers)
  const baseTime = 1_700_000_000_000

  function fromChange(change: number) {
    return new Date(baseTime + change)
  }

  it('returns an empty string when time is invalid', () => {
    expect(formatTimeAgo(new Date('invalid date'))).toBe('')
  })

  describe('just now', () => {
    it('just now', () => {
      expect(formatTimeAgo(new Date(baseTime), {}, baseTime)).toBe('just now')
    })

    it('just now using string messages with the {0} placeholder', () => {
      expect(formatTimeAgo(new Date(baseTime), {
        showSecond: true,
        messages: {
          justNow: 'just now',
          past: '{0} ago',
          future: '{0}',
          invalid: '',
          second: '{0}',
          minute: '{0}m',
          hour: '{0}h',
          day: '{0}d',
          week: '{0}w',
          month: '{0}mo',
          year: '{0}y',
        },
      }, baseTime)).toBe('0')
    })
  })

  describe('second', () => {
    function testSecond(isFuture: boolean) {
      const text = isFuture ? 'future' : 'past'
      const nextTime = getNeededTimeChange('minute', 1, -1) * (isFuture ? 1 : -1)

      it(`${text}: less than 1 minute`, () => {
        expect(formatTimeAgo(fromChange(nextTime), {}, baseTime)).toBe('just now')
      })

      it(`${text}: less than 1 second`, () => {
        const change = getNeededTimeChange('minute', 1, -59.6) * (isFuture ? 1 : -1)
        expect(formatTimeAgo(fromChange(change), { showSecond: true }, baseTime)).toBe(
          isFuture ? 'in 0 second' : '0 second ago',
        )
      })

      it(`${text}: less than 1 minute/ with showSecond`, () => {
        expect(formatTimeAgo(fromChange(nextTime), { showSecond: true }, baseTime)).toBe(
          isFuture ? 'in 59 seconds' : '59 seconds ago',
        )
      })

      it(`${text}: less than 1 minute but more than 10 seconds with showSecond`, () => {
        expect(formatTimeAgo(fromChange(nextTime), { showSecond: true, max: 10000 }, baseTime)).toBe(fullDateFormatter(baseTime + nextTime))
      })

      it(`${text}: more than 1 minute`, () => {
        const change = getNeededTimeChange('minute', 1, 1) * (isFuture ? 1 : -1)
        expect(formatTimeAgo(fromChange(change), { showSecond: true, max: 'second' }, baseTime)).toBe(fullDateFormatter(baseTime + change))
      })
    }

    testSecond(true)
    testSecond(false)
  })

  describe('minute', () => {
    it('future: 1 minute', () => {
      expect(formatTimeAgo(fromChange(getNeededTimeChange('minute', 1)), {}, baseTime)).toBe('in 1 minute')
    })

    it('past: 1 minute', () => {
      expect(formatTimeAgo(fromChange(-getNeededTimeChange('minute', 1)), {}, baseTime)).toBe('1 minute ago')
    })

    it('future: 10 minutes', () => {
      expect(formatTimeAgo(fromChange(getNeededTimeChange('minute', 10)), {}, baseTime)).toBe('in 10 minutes')
    })

    it('past: 10 minutes', () => {
      expect(formatTimeAgo(fromChange(-getNeededTimeChange('minute', 10)), {}, baseTime)).toBe('10 minutes ago')
    })
  })

  describe('hour', () => {
    it('future: 1 hour', () => {
      expect(formatTimeAgo(fromChange(getNeededTimeChange('hour', 1)), {}, baseTime)).toBe('in 1 hour')
    })

    it('past: 1 hour', () => {
      expect(formatTimeAgo(fromChange(-getNeededTimeChange('hour', 1)), {}, baseTime)).toBe('1 hour ago')
    })

    it('future: 10 hours', () => {
      expect(formatTimeAgo(fromChange(getNeededTimeChange('hour', 10)), {}, baseTime)).toBe('in 10 hours')
    })

    it('past: 10 hours', () => {
      expect(formatTimeAgo(fromChange(-getNeededTimeChange('hour', 10)), {}, baseTime)).toBe('10 hours ago')
    })
  })

  describe('day', () => {
    it('future: 1 day', () => {
      expect(formatTimeAgo(fromChange(getNeededTimeChange('day', 1)), {}, baseTime)).toBe('tomorrow')
    })

    it('past: 1 day', () => {
      expect(formatTimeAgo(fromChange(-getNeededTimeChange('day', 1)), {}, baseTime)).toBe('yesterday')
    })

    it('future: 3 days', () => {
      expect(formatTimeAgo(fromChange(getNeededTimeChange('day', 3)), {}, baseTime)).toBe('in 3 days')
    })

    it('past: 3 days', () => {
      expect(formatTimeAgo(fromChange(-getNeededTimeChange('day', 3)), {}, baseTime)).toBe('3 days ago')
    })
  })

  describe('week', () => {
    it('future: 1 week', () => {
      expect(formatTimeAgo(fromChange(getNeededTimeChange('week', 1)), {}, baseTime)).toBe('next week')
    })

    it('past: 1 week', () => {
      expect(formatTimeAgo(fromChange(-getNeededTimeChange('week', 1)), {}, baseTime)).toBe('last week')
    })

    it('future: 3 weeks', () => {
      expect(formatTimeAgo(fromChange(getNeededTimeChange('week', 3)), {}, baseTime)).toBe('in 3 weeks')
    })

    it('past: 3 weeks', () => {
      expect(formatTimeAgo(fromChange(-getNeededTimeChange('week', 3)), {}, baseTime)).toBe('3 weeks ago')
    })
  })

  describe('month', () => {
    it('future: 1 month', () => {
      expect(formatTimeAgo(fromChange(getNeededTimeChange('month', 1)), {}, baseTime)).toBe('next month')
    })

    it('past: 1 month', () => {
      expect(formatTimeAgo(fromChange(-getNeededTimeChange('month', 1)), {}, baseTime)).toBe('last month')
    })

    it('future: 3 months', () => {
      expect(formatTimeAgo(fromChange(getNeededTimeChange('month', 3)), {}, baseTime)).toBe('in 3 months')
    })

    it('past: 3 months', () => {
      expect(formatTimeAgo(fromChange(-getNeededTimeChange('month', 3)), {}, baseTime)).toBe('3 months ago')
    })
  })

  describe('year', () => {
    it('future: 1 year', () => {
      expect(formatTimeAgo(fromChange(getNeededTimeChange('year', 1)), {}, baseTime)).toBe('next year')
    })

    it('past: 1 year', () => {
      expect(formatTimeAgo(fromChange(-getNeededTimeChange('year', 1)), {}, baseTime)).toBe('last year')
    })

    it('future: 3 years', () => {
      expect(formatTimeAgo(fromChange(getNeededTimeChange('year', 3)), {}, baseTime)).toBe('in 3 years')
    })

    it('past: 3 years', () => {
      expect(formatTimeAgo(fromChange(-getNeededTimeChange('year', 3)), {}, baseTime)).toBe('3 years ago')
    })
  })

  it('rounding', () => {
    const change = getNeededTimeChange('day', 5.49)
    expect(formatTimeAgo(fromChange(change), {}, baseTime)).toBe('in 5 days')
    expect(formatTimeAgo(fromChange(change), { rounding: 'ceil' }, baseTime)).toBe('in 6 days')
    expect(formatTimeAgo(fromChange(change), { rounding: 'floor' }, baseTime)).toBe('in 5 days')
    expect(formatTimeAgo(fromChange(change), { rounding: 1 }, baseTime)).toBe('in 5.5 days')
    expect(formatTimeAgo(fromChange(change), { rounding: 3 }, baseTime)).toBe('in 5.49 days')
  })

  it('rounding unit fallback', () => {
    const change = getNeededTimeChange('month', 11.5)
    expect(formatTimeAgo(fromChange(change), {}, baseTime)).toBe('next year')
    expect(formatTimeAgo(fromChange(change), { rounding: 'ceil' }, baseTime)).toBe('next year')
    expect(formatTimeAgo(fromChange(change), { rounding: 'floor' }, baseTime)).toBe('in 11 months')
    expect(formatTimeAgo(fromChange(change), { rounding: 1 }, baseTime)).toBe('in 0.9 year')
    expect(formatTimeAgo(fromChange(change), { rounding: 3 }, baseTime)).toBe('in 0.945 year')
  })

  it('custom units', () => {
    const change = getNeededTimeChange('day', 14)
    expect(formatTimeAgo(fromChange(change), {}, baseTime)).toBe('in 2 weeks')
    expect(formatTimeAgo(fromChange(change), {
      units: [
        { max: 60000, value: 1000, name: 'second' },
        { max: 2760000, value: 60000, name: 'minute' },
        { max: 72000000, value: 3600000, name: 'hour' },
        { max: 518400000 * 30, value: 86400000, name: 'day' },
        { max: 28512000000, value: 2592000000, name: 'month' },
        { max: Number.POSITIVE_INFINITY, value: 31536000000, name: 'year' },
      ],
    }, baseTime)).toBe('in 14 days')
  })

  it('custom messages (function formatters)', () => {
    const change = -getNeededTimeChange('minute', 5)
    expect(formatTimeAgo(fromChange(change), { messages: zhMessages }, baseTime)).toBe('5分钟前')
  })
})

describe('useTimeAgo', () => {
  it('formats a past timestamp', async () => {
    const past = Date.now() - 1000 * 60 * 5

    const { result } = await renderHook(() => useTimeAgo(past))

    expect(result.current).toBe('5 minutes ago')
  })

  it('formats a future timestamp', async () => {
    const future = Date.now() + 1000 * 60 * 5

    const { result } = await renderHook(() => useTimeAgo(future))

    expect(result.current).toBe('in 5 minutes')
  })

  it('accepts Date, number and string inputs', async () => {
    const past = Date.now() - 1000 * 60 * 5
    const expected = '5 minutes ago'

    const asNumber = await renderHook(() => useTimeAgo(past))
    const asDate = await renderHook(() => useTimeAgo(new Date(past)))
    const asString = await renderHook(() => useTimeAgo(new Date(past).toISOString()))

    expect(asNumber.result.current).toBe(expected)
    expect(asDate.result.current).toBe(expected)
    expect(asString.result.current).toBe(expected)
  })

  it('shows just now for less than a minute', async () => {
    const { result } = await renderHook(() => useTimeAgo(Date.now()))

    expect(result.current).toBe('just now')
  })

  it('returns an empty string for invalid input', async () => {
    const { result } = await renderHook(() => useTimeAgo('invalid date'))

    expect(result.current).toBe('')
  })

  it('falls back to the full date past max', async () => {
    const past = Date.now() - 1000 * 60 * 60 * 2

    const { result } = await renderHook(() => useTimeAgo(past, { max: 1000 * 60 * 90 }))

    // derived at runtime — the ISO date slice is timezone-independent
    expect(result.current).toBe(new Date(past).toISOString().slice(0, 10))
  })

  it('supports custom messages', async () => {
    const past = Date.now() - 1000 * 60 * 5

    const { result } = await renderHook(() => useTimeAgo(past, { messages: zhMessages }))

    expect(result.current).toBe('5分钟前')
  })

  it('re-renders as time passes with updateInterval', async () => {
    const start = Date.now()

    const { result } = await renderHook(() => useTimeAgo(start, {
      showSecond: true,
      units: [{ max: Number.POSITIVE_INFINITY, value: 1000, name: 'second' }],
      updateInterval: 50,
    }))

    // `time` never changes — only the interval ticks can move the output
    // from `just now`-style `0 second ago` to `1 second ago`, `2 seconds ago`, ...
    const initial = Number.parseInt(result.current, 10) || 0
    await expect.poll(() => Number.parseInt(result.current, 10) || 0, { timeout: 10_000, interval: 100 })
      .toBeGreaterThan(initial)
  })

  it('clears its update interval on unmount', async () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')

    const { unmount } = await renderHook(() => useTimeAgo(Date.now(), { updateInterval: 50 }))

    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })
})

describe('useTimeAgo (component)', () => {
  it('updates when the input time changes', async () => {
    function UseTimeAgoProbe() {
      const [offset, setOffset] = useState(0)
      const time = Date.now() - 1000 * 60 * 5 + offset
      const timeAgo = useTimeAgo(time)

      return (
        <div>
          <p>{timeAgo}</p>
          <button onClick={() => setOffset(current => current - 60_000)}>older</button>
        </div>
      )
    }

    const screen = await render(<UseTimeAgoProbe />)
    await expect.element(screen.getByText('5 minutes ago')).toBeVisible()

    await screen.getByRole('button', { name: 'older' }).click()

    await expect.element(screen.getByText('6 minutes ago')).toBeVisible()
  })
})
