import type { TemporalImplementation, TemporalZonedDateTime, UseTemporalNowControls, UseTemporalNowScheduler } from '../useTemporalNow'
import { useCallback, useEffect, useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useTemporalNow } from '../useTemporalNow'

// Test scheduler mirroring @reause/shared's `useIntervalFn` — package sources
// (including test files) must not import `@reause/*`, so the scheduler that
// upstream tests express as `cb => useIntervalFn(cb, 100)` is inlined here.
function useTestIntervalFn(cb: () => void, interval: number, immediate = true): UseTemporalNowControls {
  const [isActive, setIsActive] = useState(immediate)
  const cbRef = useRef(cb)
  cbRef.current = cb

  useEffect(() => {
    if (!isActive)
      return
    const id = setInterval(() => cbRef.current(), interval)
    return () => clearInterval(id)
  }, [isActive, interval])

  const pause = useCallback(() => setIsActive(false), [])
  const resume = useCallback(() => setIsActive(true), [])

  return { isActive, pause, resume }
}

function createIntervalScheduler(interval: number, immediate = true): UseTemporalNowScheduler {
  return (cb: () => void) => useTestIntervalFn(cb, interval, immediate)
}

// scheduler that never ticks — freezes `now` for exact assertions
const pausedScheduler = createIntervalScheduler(10_000, false)

const globalScope = globalThis as { Temporal?: unknown }

function getNativeTemporal(): TemporalImplementation {
  const native = (globalThis as { Temporal?: TemporalImplementation }).Temporal
  if (!native)
    throw new Error('native Temporal expected in the test browser')
  return native
}

function withoutGlobalTemporal<T>(run: () => T): T {
  const original = globalScope.Temporal
  delete globalScope.Temporal
  try {
    return run()
  }
  finally {
    globalScope.Temporal = original
  }
}

describe('useTemporalNow', () => {
  it('should initialize with default options', async () => {
    const { result } = await renderHook(() => useTemporalNow())

    expect(result.current.timezone).toBe('UTC')
    expect(result.current.calendar).toBe('gregory')
    expect(result.current.isActive).toBe(true)
    expect(result.current.now.timeZoneId).toBe('UTC')
    expect(typeof result.current.now.epochNanoseconds).toBe('bigint')
  })

  it('should initialize with custom options', async () => {
    const { result } = await renderHook(() => useTemporalNow({
      timezone: 'America/New_York',
      calendar: 'islamic-umalqura',
      scheduler: createIntervalScheduler(100, false),
    }))

    expect(result.current.timezone).toBe('America/New_York')
    expect(result.current.calendar).toBe('islamic-umalqura')
    expect(result.current.isActive).toBe(false)
    expect(result.current.now.timeZoneId).toBe('America/New_York')
    expect(result.current.now.calendarId).toBe('islamic-umalqura')
  })

  it('should update timezone reactively', async () => {
    const { act, result } = await renderHook(() => useTemporalNow({ scheduler: pausedScheduler }))
    const initialTz = result.current.now.timeZoneId

    act(() => result.current.setTimezone('Asia/Tokyo'))

    expect(result.current.now.timeZoneId).toBe('Asia/Tokyo')
    expect(result.current.now.timeZoneId).not.toBe(initialTz)
  })

  it('should update calendar reactively', async () => {
    const { act, result } = await renderHook(() => useTemporalNow({ scheduler: pausedScheduler }))
    const initialCal = result.current.now.calendarId

    act(() => result.current.setCalendar('islamic-umalqura'))

    expect(result.current.now.calendarId).toBe('islamic-umalqura')
    expect(result.current.now.calendarId).not.toBe(initialCal)
  })

  it('should convert to different timezone', async () => {
    const { result } = await renderHook(() => useTemporalNow({ timezone: 'UTC', scheduler: pausedScheduler }))
    const converted = result.current.toTimezone('America/New_York')

    expect(converted.timeZoneId).toBe('America/New_York')
    expect(result.current.now.timeZoneId).toBe('UTC') // original unchanged
  })

  it('should convert to different calendar', async () => {
    const { result } = await renderHook(() => useTemporalNow({ calendar: 'gregory', scheduler: pausedScheduler }))
    const converted = result.current.toCalendar('islamic-umalqura')

    expect(converted.calendarId).toBe('islamic-umalqura')
    expect(result.current.now.calendarId).toBe('gregory') // original unchanged
  })

  it('should convert to plain date', async () => {
    const { result } = await renderHook(() => useTemporalNow({ scheduler: pausedScheduler }))
    const plainDate = result.current.toPlainDate()

    expect(plainDate.toString()).toMatch(/^\d{4}-\d{2}-\d{2}(\[u-ca=\w+\])?$/)
  })

  it('should convert to plain time', async () => {
    const { result } = await renderHook(() => useTemporalNow({ scheduler: pausedScheduler }))
    const plainTime = result.current.toPlainTime()

    expect(plainTime.toString()).toMatch(/^\d{2}:\d{2}:\d{2}/)
  })

  it('should convert to plain datetime', async () => {
    const { result } = await renderHook(() => useTemporalNow({ scheduler: pausedScheduler }))
    const plainDateTime = result.current.toPlainDateTime()

    expect(plainDateTime.toString()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  })

  it('should format datetime', async () => {
    const { result } = await renderHook(() => useTemporalNow({ scheduler: pausedScheduler }))
    const formatted = result.current.format({ dateStyle: 'short' })

    expect(typeof formatted).toBe('string')
    expect(formatted).toMatch(/\d/)
  })

  it('should add duration', async () => {
    const { result } = await renderHook(() => useTemporalNow({ scheduler: pausedScheduler }))
    const original = result.current.now
    const added = result.current.add('P1D') // add 1 day

    expect(added.epochNanoseconds - original.epochNanoseconds).toBe(86_400_000_000_000n)
  })

  it('should add duration object', async () => {
    const { result } = await renderHook(() => useTemporalNow({ scheduler: pausedScheduler }))
    const original = result.current.now
    const added = result.current.add({ hours: 2 })

    expect(added.epochNanoseconds - original.epochNanoseconds).toBe(7_200_000_000_000n)
  })

  it('should subtract duration', async () => {
    const { result } = await renderHook(() => useTemporalNow({ scheduler: pausedScheduler }))
    const original = result.current.now
    const subtracted = result.current.subtract('P1D') // subtract 1 day

    expect(original.epochNanoseconds - subtracted.epochNanoseconds).toBe(86_400_000_000_000n)
  })

  it('should compare dates', async () => {
    const { result } = await renderHook(() => useTemporalNow({ scheduler: pausedScheduler }))
    const future = result.current.add('P1D')
    const past = result.current.subtract('P1D')

    expect(result.current.compare(future)).toBe(-1) // now is before future
    expect(result.current.compare(past)).toBe(1) // now is after past
    expect(result.current.compare(result.current.now)).toBe(0) // now equals now
  })

  it('should compare with string dates', async () => {
    const { result } = await renderHook(() => useTemporalNow({ scheduler: pausedScheduler }))
    const futureString = result.current.add('P1D').toString()

    expect(result.current.compare(futureString)).toBe(-1)
  })

  it('should pause and resume updates', async () => {
    const { act, result } = await renderHook(() => useTemporalNow({ scheduler: createIntervalScheduler(100) }))

    expect(result.current.isActive).toBe(true)

    act(() => result.current.pause())
    expect(result.current.isActive).toBe(false)

    act(() => result.current.resume())
    expect(result.current.isActive).toBe(true)
  })

  it('should update automatically with interval', async () => {
    const { result } = await renderHook(() => useTemporalNow({ scheduler: createIntervalScheduler(100) }))
    const initialTime = result.current.now.epochNanoseconds

    await expect.poll(() => result.current.now.epochNanoseconds > initialTime).toBe(true)
  })

  it('should update automatically with the default rAF scheduler', async () => {
    const { result } = await renderHook(() => useTemporalNow())
    const initialTime = result.current.now.epochNanoseconds

    await expect.poll(() => result.current.now.epochNanoseconds > initialTime).toBe(true)
  })

  it('should not start immediately when the scheduler is not immediate', async () => {
    const { result } = await renderHook(() => useTemporalNow({ scheduler: createIntervalScheduler(100, false) }))

    expect(result.current.isActive).toBe(false)

    const frozen = result.current.now.epochNanoseconds
    await new Promise(resolve => setTimeout(resolve, 250))
    expect(result.current.now.epochNanoseconds).toBe(frozen)
  })

  it('should stop updating after unmount', async () => {
    let ticks = 0
    const scheduler: UseTemporalNowScheduler = (cb: () => void) => useTestIntervalFn(() => {
      ticks++
      cb()
    }, 50)

    const { unmount } = await renderHook(() => useTemporalNow({ scheduler }))
    await expect.poll(() => ticks > 0).toBe(true)

    unmount()
    const ticksAtUnmount = ticks
    await new Promise(resolve => setTimeout(resolve, 200))
    expect(ticks).toBe(ticksAtUnmount)
  })

  it('should throw when the global Temporal object is unavailable', () => {
    withoutGlobalTemporal(() => {
      expect(() => useTemporalNow()).toThrow(/Temporal/)
    })
  })

  it('should use a custom `temporal` implementation instead of the global one', async () => {
    const native = getNativeTemporal()
    let calls = 0
    const custom: TemporalImplementation = {
      Now: {
        zonedDateTimeISO(timezone?: string) {
          calls++
          return native.Now.zonedDateTimeISO(timezone)
        },
      },
      ZonedDateTime: {
        compare: (a: TemporalZonedDateTime, b: TemporalZonedDateTime | string) => native.ZonedDateTime.compare(a, b),
      },
    }

    const { result } = await renderHook(() => useTemporalNow({ temporal: custom, scheduler: pausedScheduler }))

    expect(calls).toBeGreaterThan(0)
    expect(result.current.now.timeZoneId).toBe('UTC')
  })

  // Upstream drives these interop tests with the real `temporal-polyfill` /
  // `@js-temporal/polyfill` packages (upstream index.test.ts:11, :217-249).
  // Neither is installed in this repo, so a fully independent, hand-rolled
  // `TemporalImplementation` stands in: it exercises the same end-to-end
  // interop contract — the hook must work with ANY spec-compliant
  // implementation, not just the ambient native `Temporal`.
  it('interops end-to-end with an independently authored `temporal` implementation', async () => {
    const nextEpoch = 1_000_000n

    function fakeZonedDateTime(epochNs: bigint, timeZoneId: string, calendarId: string): TemporalZonedDateTime {
      return {
        epochNanoseconds: epochNs,
        timeZoneId,
        calendarId,
        withTimeZone: tz => fakeZonedDateTime(epochNs, tz, calendarId),
        withCalendar: cal => fakeZonedDateTime(epochNs, timeZoneId, cal),
        toPlainDate: () => ({ toString: () => '2023-12-25' }),
        toPlainTime: () => ({ toString: () => '15:30:00' }),
        toPlainDateTime: () => ({ toString: () => '2023-12-25T15:30:00' }),
        toLocaleString: () => '12/25/2023, 3:30:00 PM',
        add: _duration => fakeZonedDateTime(epochNs + 1n, timeZoneId, calendarId),
        subtract: _duration => fakeZonedDateTime(epochNs - 1n, timeZoneId, calendarId),
      }
    }

    const fakeTemporal: TemporalImplementation = {
      Now: {
        zonedDateTimeISO(timezone = 'UTC') {
          return fakeZonedDateTime(nextEpoch, timezone, 'gregory')
        },
      },
      ZonedDateTime: {
        compare: (a: TemporalZonedDateTime, b: TemporalZonedDateTime | string) => {
          const bEpoch = typeof b === 'string' ? null : b.epochNanoseconds
          if (bEpoch == null)
            return 0
          return a.epochNanoseconds < bEpoch ? -1 : a.epochNanoseconds > bEpoch ? 1 : 0
        },
      },
    }

    const { result } = await renderHook(() => useTemporalNow({
      temporal: fakeTemporal,
      timezone: 'Asia/Tokyo',
      scheduler: pausedScheduler,
    }))

    // `now` comes from the custom implementation, not the ambient native one
    expect(result.current.now.timeZoneId).toBe('Asia/Tokyo')
    expect(result.current.now.epochNanoseconds).toBe(nextEpoch)
    expect(result.current.now.toPlainDate().toString()).toBe('2023-12-25')
    expect(result.current.format()).toBe('12/25/2023, 3:30:00 PM')

    // add/subtract/compare all flow through the custom implementation
    expect(result.current.add('P1D').epochNanoseconds).toBe(nextEpoch + 1n)
    expect(result.current.subtract('P1D').epochNanoseconds).toBe(nextEpoch - 1n)
    expect(result.current.compare(result.current.add('P1D'))).toBe(-1)
  })

  it('should work even when the global Temporal object is unavailable, given a custom implementation', async () => {
    const native = getNativeTemporal()
    const custom: TemporalImplementation = {
      Now: {
        zonedDateTimeISO(timezone?: string) {
          return native.Now.zonedDateTimeISO(timezone)
        },
      },
      ZonedDateTime: {
        compare: (a: TemporalZonedDateTime, b: TemporalZonedDateTime | string) => native.ZonedDateTime.compare(a, b),
      },
    }

    await withoutGlobalTemporal(async () => {
      const { result } = await renderHook(() => useTemporalNow({ temporal: custom, scheduler: pausedScheduler }))
      expect(result.current.now.timeZoneId).toBe('UTC')
    })
  })
})

describe('edge cases', () => {
  it('should handle invalid timezone gracefully', () => {
    expect(() => {
      useTemporalNow({ timezone: 'Invalid/Timezone' })
    }).toThrow()
  })

  it('should handle invalid calendar gracefully', () => {
    expect(() => {
      useTemporalNow({ calendar: 'invalid-calendar' })
    }).toThrow()
  })

  it('should handle invalid duration strings', async () => {
    const { result } = await renderHook(() => useTemporalNow({ scheduler: pausedScheduler }))

    expect(() => {
      result.current.add('invalid-duration')
    }).toThrow()
  })

  it('should handle multiple pause/resume calls', async () => {
    const { act, result } = await renderHook(() => useTemporalNow())

    act(() => result.current.pause())
    act(() => result.current.pause()) // should not throw
    expect(result.current.isActive).toBe(false)

    act(() => result.current.resume())
    act(() => result.current.resume()) // should not throw
    expect(result.current.isActive).toBe(true)
  })
})
