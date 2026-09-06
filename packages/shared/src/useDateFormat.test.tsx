import { useEffect, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, renderHook } from 'vitest-browser-react'
import { formatDate, normalizeDate, useDateFormat } from './useDateFormat'

describe('useDateFormat', () => {
  it('should export module', () => {
    expect(normalizeDate).toBeDefined()
    expect(formatDate).toBeDefined()
    expect(useDateFormat).toBeDefined()
  })

  it('should normalize date', () => {
    const date = new Date(2022, 0, 1, 0, 0, 0)
    const currentDate = new Date().toDateString()

    expect(normalizeDate(undefined).toDateString()).toBe(currentDate)
    // @ts-expect-error test null
    expect(normalizeDate(null).toString()).toBe('Invalid Date')
    expect(normalizeDate(new Date()).toDateString()).toBe(currentDate)
    expect(normalizeDate(new Date().toString()).toDateString()).toBe(currentDate)
    // Use a fixed date to avoid timezone edge cases near midnight
    const fixedDate = new Date(2022, 5, 15, 12, 0, 0)
    expect.soft(normalizeDate(fixedDate.toISOString().replace('Z', '')).toDateString()).toBe(fixedDate.toDateString())

    expect(normalizeDate('2022-01')).toEqual(date)
    expect(normalizeDate('2022-01-01')).toEqual(date)
    expect(normalizeDate('2022-01-01T00:00:00.000')).toEqual(date)
  })

  it('should work with default', () => {
    expect(useDateFormat(new Date('2022-01-01 10:24:00'))).toBe('10:24:00')
  })

  it('should work with time string ', () => {
    expect(useDateFormat('2022-01-01 20:24:24', 'YYYY—MM-DD HH:mm:ss')).toBe('2022—01-01 20:24:24')
  })

  it('should work with YYYY-MM-DD', () => {
    expect(useDateFormat(new Date('2022-01-01 10:24:00'), 'YYYY-MM-DD')).toBe('2022-01-01')
  })

  it('should work with YY-M-D', () => {
    expect(useDateFormat(new Date('2022-01-01 10:24:00'), 'YY-M-D')).toBe('22-1-1')
  })

  it('should work with H:m:ss', () => {
    expect(useDateFormat(new Date('2022-01-01 10:24:00'), 'H:m:s')).toBe('10:24:0')
  })

  it('should work with h:m:s', () => {
    expect(useDateFormat(new Date('2022-01-01 00:05:00'), 'h:m:s')).toBe('12:5:0')
    expect(useDateFormat(new Date('2022-01-01 08:05:00'), 'h:m:s')).toBe('8:5:0')
  })

  it('should work with hh:mm:ss', () => {
    expect(useDateFormat(new Date('2022-01-01 00:05:05'), 'hh:mm:ss')).toBe('12:05:05')
    expect(useDateFormat(new Date('2022-01-01 15:05:05'), 'hh:mm:ss')).toBe('03:05:05')
  })

  it('should work with HH:mm:ss', () => {
    expect(useDateFormat(new Date('2022-01-01 15:05:05'), 'HH:mm:ss')).toBe('15:05:05')
  })

  it('should work with HH:mm:ss:SSS', () => {
    expect(useDateFormat(new Date('2022-01-01 15:05:05:999'), 'HH:mm:ss:SSS')).toBe('15:05:05:999')
  })

  it('should work with HH:mm:ss d', () => {
    expect(useDateFormat(new Date('2022-01-01 15:05:05'), 'HH:mm:ss d')).toBe('15:05:05 6')
  })

  it('should work with YYYY/MM/DD dd', () => {
    expect(useDateFormat(new Date('2022-01-01 15:05:05'), 'YYYY/MM/DD dd', { locales: 'en-US' })).toBe('2022/01/01 S')
  })

  it('should work with YYYY/MM/DD ddd', () => {
    expect(useDateFormat(new Date('2022-01-01 15:05:05'), 'YYYY/MM/DD ddd', { locales: 'en-US' })).toBe('2022/01/01 Sat')
  })

  it('should work with YYYY/MM/DD dddd', () => {
    expect(useDateFormat(new Date('2022-01-01 15:05:05'), 'YYYY/MM/DD dddd', { locales: 'en-US' })).toBe('2022/01/01 Saturday')
  })

  it('should work with MMM DD YYYY', () => {
    expect(useDateFormat(new Date('2022-01-01 15:05:05'), 'MMM DD YYYY', { locales: 'en-US' })).toBe('Jan 01 2022')
  })

  it('should work with MMMM DD YYYY', () => {
    expect(useDateFormat(new Date('2022-01-01 15:05:05'), 'MMMM DD YYYY', { locales: 'en-US' })).toBe('January 01 2022')
  })

  it('should work with Mo Do Yo', () => {
    expect(useDateFormat(new Date('2022-01-01 15:05:05'), 'MMMM Do Yo', { locales: 'en-US' })).toBe('January 1st 2022nd')
    expect(useDateFormat(new Date('2022-12-11 15:05:05'), 'MMMM Do Yo', { locales: 'en-US' })).toBe('December 11th 2022nd')
    expect(useDateFormat(new Date('2023-12-12 15:05:05'), 'MMMM Do Yo', { locales: 'en-US' })).toBe('December 12th 2023rd')
    expect(useDateFormat(new Date('2024-12-23 15:05:05'), 'MMMM Do Yo', { locales: 'en-US' })).toBe('December 23rd 2024th')
  })

  it('should escape literal text wrapped in brackets', () => {
    expect(useDateFormat(new Date('2022-01-01 10:24:00'), '[YYYY-MM-DD] YYYY-MM-DD')).toBe('YYYY-MM-DD 2022-01-01')
  })

  describe('reactive inputs', () => {
    it('re-reads a ref-like date ({ current }) on every render', async () => {
      const date = { current: new Date('2022-01-01 10:24:00') }
      const { result, rerender } = await renderHook(() => useDateFormat(date, 'YYYY-MM-DD HH:mm:ss'))
      expect(result.current).toBe('2022-01-01 10:24:00')

      date.current = new Date('2023-06-15 08:30:45')
      await rerender()
      expect(result.current).toBe('2023-06-15 08:30:45')
    })

    it('re-reads a getter formatStr on every render', async () => {
      let format = 'YYYY'
      const { result, rerender } = await renderHook(() => useDateFormat(new Date('2022-01-01 10:24:00'), () => format))
      expect(result.current).toBe('2022')

      format = 'HH:mm:ss'
      await rerender()
      expect(result.current).toBe('10:24:00')
    })
  })

  describe('meridiem', () => {
    it.each([
      // AM
      { dateStr: '2022-01-01 03:05:05', formatStr: 'hh:mm:ss A', expected: '03:05:05 AM' },
      { dateStr: '2022-01-01 03:05:05', formatStr: 'hh:mm:ss AA', expected: '03:05:05 A.M.' },
      { dateStr: '2022-01-01 03:05:05', formatStr: 'hh:mm:ss a', expected: '03:05:05 am' },
      { dateStr: '2022-01-01 03:05:05', formatStr: 'hh:mm:ss aa', expected: '03:05:05 a.m.' },
      // PM
      { dateStr: '2022-01-01 15:05:05', formatStr: 'hh:mm:ss A', expected: '03:05:05 PM' },
      { dateStr: '2022-01-01 15:05:05', formatStr: 'hh:mm:ss AA', expected: '03:05:05 P.M.' },
      { dateStr: '2022-01-01 15:05:05', formatStr: 'hh:mm:ss a', expected: '03:05:05 pm' },
      { dateStr: '2022-01-01 15:05:05', formatStr: 'hh:mm:ss aa', expected: '03:05:05 p.m.' },
    ])(
      'should work with $formatStr',
      ({ dateStr, formatStr, expected }) => {
        expect(useDateFormat(new Date(dateStr), formatStr)).toBe(expected)
      },
    )

    const customMeridiem = (hours: number, minutes: number, isLowercase?: boolean, hasPeriod?: boolean) => {
      const m = hours > 11 ? (isLowercase ? 'μμ' : 'ΜΜ') : (isLowercase ? 'πμ' : 'ΠΜ')
      return hasPeriod ? m.split('').reduce((acc, curr) => acc += `${curr}.`, '') : m
    }

    it.each([
      // AM
      { dateStr: '2022-01-01 03:05:05', formatStr: 'hh:mm:ss A', expected: '03:05:05 ΠΜ' },
      { dateStr: '2022-01-01 03:05:05', formatStr: 'hh:mm:ss AA', expected: '03:05:05 Π.Μ.' },
      { dateStr: '2022-01-01 03:05:05', formatStr: 'hh:mm:ss a', expected: '03:05:05 πμ' },
      { dateStr: '2022-01-01 03:05:05', formatStr: 'hh:mm:ss aa', expected: '03:05:05 π.μ.' },
      // PM
      { dateStr: '2022-01-01 15:05:05', formatStr: 'hh:mm:ss A', expected: '03:05:05 ΜΜ' },
      { dateStr: '2022-01-01 15:05:05', formatStr: 'hh:mm:ss AA', expected: '03:05:05 Μ.Μ.' },
      { dateStr: '2022-01-01 15:05:05', formatStr: 'hh:mm:ss a', expected: '03:05:05 μμ' },
      { dateStr: '2022-01-01 15:05:05', formatStr: 'hh:mm:ss aa', expected: '03:05:05 μ.μ.' },
    ])('should work with custom meridiem with $formatStr', ({ dateStr, formatStr, expected }) => {
      expect(useDateFormat(new Date(dateStr), formatStr, { customMeridiem })).toBe(expected)
    })
  })

  it('formatDate', () => {
    expect(formatDate(new Date('Sun Jul 30 2023 21:15:42 GMT+0800'), 'd'))
      .toMatchInlineSnapshot('"0"')
  })

  describe('timezone', () => {
    // upstream hardcodes `GMT+1` for its CI timezone — instead derive the
    // expected zone names from the runtime's `Intl` (independent of the
    // implementation's token mapping and `split` logic, and agnostic to both
    // timezone and ICU version: zero offset renders as `GMT`, `GMT+0` or
    // `GMT+00:00` depending on the engine)
    function expectedZone(date: Date, timeZoneName: 'shortOffset' | 'longOffset'): string {
      const parts = new Intl.DateTimeFormat(undefined, { timeZoneName }).formatToParts(date)
      return parts.find(part => part.type === 'timeZoneName')?.value ?? ''
    }

    it.each([
      { formatStr: 'hh:mm:ss z' },
      { formatStr: 'hh:mm:ss zz' },
      { formatStr: 'hh:mm:ss zzz' },
    ])(
      'should work with $formatStr',
      ({ formatStr }) => {
        const date = new Date('2022-01-01 03:05:05')
        expect(useDateFormat(date, formatStr)).toBe(`03:05:05 ${expectedZone(date, 'shortOffset')}`)
      },
    )

    it('should work with zzzz', () => {
      const date = new Date('2022-01-01 03:05:05')
      expect(useDateFormat(date, 'hh:mm:ss zzzz')).toBe(`03:05:05 ${expectedZone(date, 'longOffset')}`)
    })
  })
})

describe('useDateFormat (component)', () => {
  function UseDateFormatDemo() {
    const [date, setDate] = useState(() => new Date('2022-01-01 10:24:00'))

    return (
      <div>
        <p>{useDateFormat(date, 'YYYY-MM-DD HH:mm:ss')}</p>
        <button onClick={() => setDate(current => new Date(current.getTime() + 61_000))}>tick</button>
      </div>
    )
  }

  it('updates the formatted string as the date state changes', async () => {
    const screen = await render(<UseDateFormatDemo />)
    await expect.element(screen.getByText('2022-01-01 10:24:00')).toBeVisible()

    await screen.getByRole('button', { name: 'tick' }).click()

    await expect.element(screen.getByText('2022-01-01 10:25:01')).toBeVisible()
  })

  it('reformats on every render with an interval-updated date', async () => {
    function TickingClock() {
      const [date, setDate] = useState(() => new Date('2022-01-01 10:24:00'))
      useEffect(() => {
        const timer = setInterval(() => setDate(current => new Date(current.getTime() + 1000)), 1000)
        return () => clearInterval(timer)
      }, [])

      return <p>{useDateFormat(date, 'mm:ss')}</p>
    }

    const screen = await render(<TickingClock />)
    await expect.element(screen.getByText('24:00')).toBeVisible()

    await expect.element(screen.getByText('24:02'), { timeout: 4000 }).toBeVisible()
  })
})
