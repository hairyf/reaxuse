import type { MaybeRef } from './index'
import { toValue } from './utils'

export type DateLike = Date | number | string | undefined

export interface UseDateFormatOptions {
  /**
   * The locale(s) to used for dd/ddd/dddd/MMM/MMMM format
   *
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locales_argument).
   *
   * Accepts a plain value, a ref-like `{ current }` or a getter (upstream:
   * `MaybeRefOrGetter<Intl.LocalesArgument>`).
   */
  locales?: MaybeRef<Intl.LocalesArgument> | (() => Intl.LocalesArgument)

  /**
   * A custom function to re-modify the way to display meridiem
   *
   */
  customMeridiem?: (hours: number, minutes: number, isLowercase?: boolean, hasPeriod?: boolean) => string
}

// eslint-disable-next-line regexp/no-misleading-capturing-group
const REGEX_PARSE = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[T\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/i
const REGEX_FORMAT = /[YMDHhms]o|\[([^\]]+)\]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a{1,2}|A{1,2}|m{1,2}|s{1,2}|Z{1,2}|z{1,4}|SSS/g

function defaultMeridiem(hours: number, minutes: number, isLowercase?: boolean, hasPeriod?: boolean) {
  let m = (hours < 12 ? 'AM' : 'PM')
  if (hasPeriod)
    m = m.split('').reduce((acc, curr) => acc += `${curr}.`, '')
  return isLowercase ? m.toLowerCase() : m
}

function formatOrdinal(num: number) {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = num % 100
  return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

/**
 * Unwrap the house input convention — a plain value, a ref-like `{ current }`
 * or a getter function (house replacement for Vue's `toValue` /
 * `MaybeRefOrGetter<T>`).
 */
export function formatDate(date: Date, formatStr: string, options: UseDateFormatOptions = {}) {
  const years = date.getFullYear()
  const month = date.getMonth()
  const days = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  const milliseconds = date.getMilliseconds()
  const day = date.getDay()
  const meridiem = options.customMeridiem ?? defaultMeridiem
  const stripTimeZone = (dateString: string) => {
    return dateString.split(' ')[1] ?? ''
  }
  const matches: Record<string, () => string | number> = {
    Yo: () => formatOrdinal(years),
    YY: () => String(years).slice(-2),
    YYYY: () => years,
    M: () => month + 1,
    Mo: () => formatOrdinal(month + 1),
    MM: () => `${month + 1}`.padStart(2, '0'),
    MMM: () => date.toLocaleDateString(toValue(options.locales), { month: 'short' }),
    MMMM: () => date.toLocaleDateString(toValue(options.locales), { month: 'long' }),
    D: () => String(days),
    Do: () => formatOrdinal(days),
    DD: () => `${days}`.padStart(2, '0'),
    H: () => String(hours),
    Ho: () => formatOrdinal(hours),
    HH: () => `${hours}`.padStart(2, '0'),
    h: () => `${hours % 12 || 12}`.padStart(1, '0'),
    ho: () => formatOrdinal(hours % 12 || 12),
    hh: () => `${hours % 12 || 12}`.padStart(2, '0'),
    m: () => String(minutes),
    mo: () => formatOrdinal(minutes),
    mm: () => `${minutes}`.padStart(2, '0'),
    s: () => String(seconds),
    so: () => formatOrdinal(seconds),
    ss: () => `${seconds}`.padStart(2, '0'),
    SSS: () => `${milliseconds}`.padStart(3, '0'),
    d: () => day,
    dd: () => date.toLocaleDateString(toValue(options.locales), { weekday: 'narrow' }),
    ddd: () => date.toLocaleDateString(toValue(options.locales), { weekday: 'short' }),
    dddd: () => date.toLocaleDateString(toValue(options.locales), { weekday: 'long' }),
    A: () => meridiem(hours, minutes),
    AA: () => meridiem(hours, minutes, false, true),
    a: () => meridiem(hours, minutes, true),
    aa: () => meridiem(hours, minutes, true, true),
    z: () => stripTimeZone(date.toLocaleDateString(toValue(options.locales), { timeZoneName: 'shortOffset' })),
    zz: () => stripTimeZone(date.toLocaleDateString(toValue(options.locales), { timeZoneName: 'shortOffset' })),
    zzz: () => stripTimeZone(date.toLocaleDateString(toValue(options.locales), { timeZoneName: 'shortOffset' })),
    zzzz: () => stripTimeZone(date.toLocaleDateString(toValue(options.locales), { timeZoneName: 'longOffset' })),
  }
  return formatStr.replace(REGEX_FORMAT, (match, $1) => $1 ?? matches[match]?.() ?? match)
}

export function normalizeDate(date: DateLike) {
  if (date === null)
    return new Date(Number.NaN) // null is invalid
  if (date === undefined)
    return new Date()
  if (date instanceof Date)
    return new Date(date)
  if (typeof date === 'string' && !/Z$/i.test(date)) {
    const d = date.match(REGEX_PARSE)
    if (d) {
      const m = Number(d[2]) - 1 || 0
      const ms = Number((d[7] || '0').substring(0, 3))
      return new Date(Number(d[1]), m, Number(d[3]) || 1, Number(d[4]) || 0, Number(d[5]) || 0, Number(d[6]) || 0, ms)
    }
  }

  return new Date(date)
}

/**
 * The return type of `useDateFormat`.
 *
 * Upstream (`@vueuse/shared`) declares `ComputedRef<string>`; this React port
 * returns the formatted string directly — a plain `string` recomputed on every
 * render / call.
 */
export type UseDateFormatReturn = string

/**
 * Get the formatted date according to the string of tokens passed in.
 *
 * Map from @vueuse/shared `useDateFormat`.
 *
 * React divergence: upstream wraps the result in a Vue `computed` and returns
 * `ComputedRef<string>` — this port returns a PLAIN STRING. Call it during
 * render and pass your own reactive date state (e.g. a `useState` value); the
 * string is recomputed on every render with fresh inputs. Do not read
 * `.value` from it.
 *
 * Input reactivity (house convention replacing upstream's
 * `MaybeRefOrGetter<T>`): `date`, `formatStr` and `options.locales` each
 * accept a plain value, a ref-like `{ current }` or a getter function, and
 * are re-read on every call.
 *
 * Supported tokens (mirroring upstream 1:1, default format `HH:mm:ss`):
 * `Yo YY YYYY` — year · `M Mo MM MMM MMMM` — month (locale-aware short/long
 * names via `Intl`) · `D Do DD` — day of month · `H Ho HH` — 24-hour clock ·
 * `h ho hh` — 12-hour clock · `m mo mm` — minutes · `s so ss` — seconds ·
 * `SSS` — milliseconds (3 digits) · `d dd ddd dddd` — weekday (locale-aware
 * via `Intl`) · `A AA a aa` — meridiem, customizable via
 * `options.customMeridiem` · `z zz zzz zzzz` — timezone offset names
 * (`shortOffset` / `longOffset` via `toLocaleString`). Text wrapped in
 * brackets (`[...]`) is output literally as an escape sequence.
 *
 * @see https://vueuse.org/useDateFormat
 * @param date - The date to format, can either be a `Date` object, a timestamp, or a string
 * @param formatStr - The combination of tokens to format the date
 * @param options - UseDateFormatOptions
 *
 * @__NO_SIDE_EFFECTS__
 */
export function useDateFormat(
  date: MaybeRef<DateLike> | (() => DateLike),
  formatStr: MaybeRef<string> | (() => string) = 'HH:mm:ss',
  options: UseDateFormatOptions = {},
): UseDateFormatReturn {
  return formatDate(normalizeDate(toValue(date)), toValue(formatStr), options)
}
