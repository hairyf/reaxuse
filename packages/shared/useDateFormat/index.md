---
category: Time
---

# useDateFormat

Get the formatted date according to the string of tokens passed in, inspired by
[dayjs](https://github.com/iamkun/dayjs) — React port of VueUse's
[`useDateFormat`](https://vueuse.org/shared/useDateFormat/).

**Mapping:** upstream wraps the result in a Vue `computed` and returns
`ComputedRef<string>`. This port returns a **plain string** — call it during
render and pass your own reactive date state (e.g. a `useState` value); it
recomputes on every render with fresh inputs. `date`, `formatStr` and
`options.locales` accept a plain value, a ref-like `{ current }` or a getter
(upstream: `MaybeRefOrGetter<T>`) and are re-read on every call. The helpers
`formatDate` / `normalizeDate` are mirrored 1:1.

**List of all available formats (HH:mm:ss by default):**

| Format | Output                   | Description                             |
| ------ | ------------------------ | --------------------------------------- |
| `Yo`   | 2018th                   | Ordinal formatted year                  |
| `YY`   | 18                       | Two-digit year                          |
| `YYYY` | 2018                     | Four-digit year                         |
| `M`    | 1-12                     | The month, beginning at 1               |
| `Mo`   | 1st, 2nd, ..., 12th      | The month, ordinal formatted            |
| `MM`   | 01-12                    | The month, 2-digits                     |
| `MMM`  | Jan-Dec                  | The abbreviated month name              |
| `MMMM` | January-December         | The full month name                     |
| `D`    | 1-31                     | The day of the month                    |
| `Do`   | 1st, 2nd, ..., 31st      | The day of the month, ordinal formatted |
| `DD`   | 01-31                    | The day of the month, 2-digits          |
| `H`    | 0-23                     | The hour                                |
| `Ho`   | 0th, 1st, 2nd, ..., 23rd | The hour, ordinal formatted             |
| `HH`   | 00-23                    | The hour, 2-digits                      |
| `h`    | 1-12                     | The hour, 12-hour clock                 |
| `ho`   | 1st, 2nd, ..., 12th      | The hour, 12-hour clock, sorted         |
| `hh`   | 01-12                    | The hour, 12-hour clock, 2-digits       |
| `m`    | 0-59                     | The minute                              |
| `mo`   | 0th, 1st, ..., 59th      | The minute, ordinal formatted           |
| `mm`   | 00-59                    | The minute, 2-digits                    |
| `s`    | 0-59                     | The second                              |
| `so`   | 0th, 1st, ..., 59th      | The second, ordinal formatted           |
| `ss`   | 00-59                    | The second, 2-digits                    |
| `SSS`  | 000-999                  | The millisecond, 3-digits               |
| `A`    | AM PM                    | The meridiem                            |
| `AA`   | A.M. P.M.                | The meridiem, periods                   |
| `a`    | am pm                    | The meridiem, lowercase                 |
| `aa`   | a.m. p.m.                | The meridiem, lowercase and periods     |
| `d`    | 0-6                      | The day of the week, with Sunday as 0   |
| `dd`   | S-S                      | The min name of the day of the week     |
| `ddd`  | Sun-Sat                  | The short name of the day of the week   |
| `dddd` | Sunday-Saturday          | The name of the day of the week         |
| `z`    | GMT, GMT+1               | The timezone with offset                |
| `zz`   | GMT, GMT+1               | The timezone with offset                |
| `zzz`  | GMT, GMT+1               | The timezone with offset                |
| `zzzz` | GMT, GMT+01:00           | The long timezone with offset           |

- Meridiem is customizable by defining `customMeridiem` in `options`.
- Text wrapped in brackets (`[...]`) is output literally as an escape sequence.

## Usage

```tsx
import { useDateFormat } from '@reaxuse/shared'

const formatted = useDateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss')

const localized = useDateFormat(new Date(), 'YYYY-MM-DD (ddd)', { locales: 'en-US' })
```

<DemoContainer name="UseDateFormat" />

### Use with custom meridiem

```ts
function customMeridiem(hours: number, minutes: number, isLowercase?: boolean, hasPeriod?: boolean) {
  const m = hours > 11 ? (isLowercase ? 'μμ' : 'ΜΜ') : (isLowercase ? 'πμ' : 'ΠΜ')
  return hasPeriod ? m.split('').reduce((acc, current) => acc += `${current}.`, '') : m
}

useDateFormat('2022-01-01 05:05:05', 'hh:mm:ss A', { customMeridiem })
// → '05:05:05 ΠΜ'

useDateFormat('2022-01-01 17:05:05', 'hh:mm:ss AA', { customMeridiem })
// → '05:05:05 Μ.Μ.'
```

## Type Declarations

```ts
export type DateLike = Date | number | string | undefined

export interface UseDateFormatOptions {
  locales?: MaybeRef<Intl.LocalesArgument> | (() => Intl.LocalesArgument)
  customMeridiem?: (hours: number, minutes: number, isLowercase?: boolean, hasPeriod?: boolean) => string
}

export type UseDateFormatReturn = string

export function formatDate(date: Date, formatStr: string, options?: UseDateFormatOptions): string
export function normalizeDate(date: DateLike): Date
export function useDateFormat(
  date: MaybeRef<DateLike> | (() => DateLike),
  formatStr?: MaybeRef<string> | (() => string),
  options?: UseDateFormatOptions,
): UseDateFormatReturn
```

## Source

- VueUse: [`packages/shared/useDateFormat`](https://github.com/vueuse/vueuse/tree/main/packages/shared/useDateFormat) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useDateFormat/index.ts), tests [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useDateFormat/index.test.ts), demo [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/shared/useDateFormat/demo.vue) mirrored in [`packages/shared/src/useDateFormat.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useDateFormat.test.tsx)
- reaxuse: [`packages/shared/src/useDateFormat.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/shared/src/useDateFormat.ts)

<Contributors name="useDateFormat" />
