---
category: Time
---

# useTemporalNow

Reactive [Temporal API](https://tc39.es/proposal-temporal/docs/) with timezone conversion and calendar system support — React port of VueUse's [`useTemporalNow`](https://vueuse.org/core/useTemporalNow/).

Uses the modern Temporal API instead of the legacy `Date` object, providing better timezone handling, calendar systems, and date/time operations.

**Mapping:** `shallowRef(now)` + `useRafFn` scheduler → `useState(now)` + a scheduler composed during render (default: an internal `requestAnimationFrame` loop, cleaned up on unmount). Upstream's writable `timezone`/`calendar` refs become plain values plus `setTimezone`/`setCalendar` setters, and changing either refreshes the current `Temporal.ZonedDateTime` immediately (upstream: `watch([timezone, calendar], updateNow)`). The Temporal surface is typed with minimal inline structural types (`TemporalZonedDateTime`, `TemporalImplementation`, ...) because this repo's TypeScript libs do not ship `Temporal` types yet.

## Requirements

This function relies on the [`Temporal`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal) API. It does **not** bundle or depend on any Temporal implementation — by default it reads the global `Temporal` object, but you can also pass your own implementation via the `temporal` option.

- Modern JS engines already expose `Temporal` natively (recent Chromium/Firefox/Safari) or will soon.
- For environments without native support (e.g. Node.js < 24, used during SSR), install a polyfill yourself, for example [`temporal-polyfill`](https://github.com/fullcalendar/temporal-polyfill):

  ```bash
  npm i temporal-polyfill
  ```

  and either load it once as a global, before this hook is used (e.g. in your app's entry point):

  ```ts
  import 'temporal-polyfill/global'
  ```

  If you need calendar systems beyond `iso8601`/`gregory` (e.g. `islamic-umalqura`, `hebrew`, `chinese`, `japanese` as used below), use the `/full/` entry point instead:

  ```ts
  import 'temporal-polyfill/full/global'
  ```

  ...or pass it explicitly via the `temporal` option instead of touching the global scope:

  ```tsx
  import { useTemporalNow } from '@reaxuse/core'
  import { Temporal } from 'temporal-polyfill'

  const temporal = useTemporalNow({ temporal: Temporal })
  ```

  [`@js-temporal/polyfill`](https://github.com/js-temporal/temporal-polyfill) is another common alternative. It does not install a global `Temporal` object by itself, so the `temporal` option is the natural way to use it — cast it to the hook's structural type at the call site:

  ```tsx
  import { Temporal } from '@js-temporal/polyfill'
  import { useTemporalNow } from '@reaxuse/core'

  const temporal = useTemporalNow({ temporal: Temporal as unknown as TemporalImplementation })
  ```

If no `Temporal` implementation can be found (neither passed via the `temporal` option nor available globally), calling `useTemporalNow` throws an error.

## Usage

```tsx
import { useTemporalNow } from '@reaxuse/core'

const { now, timezone, calendar, format } = useTemporalNow()

// Display current time
console.log(format()) // "12/25/2023, 3:30:00 PM"
```

### Timezone Conversion

```tsx
const temporal = useTemporalNow({ timezone: 'America/New_York' })

// Convert to different timezones
const tokyoTime = temporal.toTimezone('Asia/Tokyo')
const londonTime = temporal.toTimezone('Europe/London')
const utcTime = temporal.toTimezone('UTC')

// Change timezone reactively (upstream: temporal.timezone.value = 'Europe/Berlin')
temporal.setTimezone('Europe/Berlin')
```

### Calendar Systems

```tsx
const temporal = useTemporalNow({ calendar: 'gregory' })

// Convert to different calendar systems
const islamicDate = temporal.toCalendar('islamic-umalqura')
const hebrewDate = temporal.toCalendar('hebrew')
const chineseDate = temporal.toCalendar('chinese')

// Change calendar reactively (upstream: temporal.calendar.value = 'islamic-umalqura')
temporal.setCalendar('islamic-umalqura')
```

### Date/Time Manipulation

```tsx
const { add, subtract, compare } = useTemporalNow()

// Add/subtract durations
const nextWeek = add('P7D') // add 7 days
const lastMonth = subtract('P1M') // subtract 1 month
const inTwoHours = add('PT2H') // add 2 hours

// Compare dates
const futureDate = add('P1Y') // add 1 year
const comparison = compare(futureDate) // -1 (now is before futureDate)
```

### Format Options

```tsx
const { format } = useTemporalNow()

// Different formatting options
const short = format({ dateStyle: 'short' }) // "12/25/23"
const long = format({ dateStyle: 'long' }) // "December 25, 2023"
const time = format({ timeStyle: 'medium' }) // "3:30:00 PM"
```

### Control Auto-Update

By default `useTemporalNow` updates on every `requestAnimationFrame`. Pass a
custom `scheduler` to control how updates are driven — for example, tick on a
fixed interval, or start paused. The scheduler is composed during render, so
it must follow the Rules of Hooks (pass it consistently across renders):

```tsx
import { useTemporalNow } from '@reaxuse/core'
import { useIntervalFn } from '@reaxuse/shared'

const { pause, resume, isActive } = useTemporalNow({
  // update every 500ms instead of on every animation frame,
  // and don't start immediately
  scheduler: cb => useIntervalFn(cb, 500, { immediate: false }),
})

// manually control updates
resume() // start auto-update
pause() // stop auto-update

console.log(isActive) // true/false
```

<DemoContainer name="UseTemporalNow" />

## Type Declarations

```ts
export interface UseTemporalNowOptions {
  /**
   * Initial timezone
   * @default 'UTC'
   */
  timezone?: string
  /**
   * Calendar system to use
   * @default 'gregory'
   */
  calendar?: string
  /**
   * Custom `Temporal` implementation to use instead of the global `Temporal`
   * object
   * @default globalThis.Temporal
   */
  temporal?: TemporalImplementation
  /**
   * Custom scheduler driving the `now` updates; must follow the Rules of
   * Hooks
   * @default requestAnimationFrame loop, started immediately
   */
  scheduler?: UseTemporalNowScheduler
}

export interface UseTemporalNowReturn extends UseTemporalNowControls {
  now: TemporalZonedDateTime
  timezone: string
  calendar: string
  setTimezone: Dispatch<SetStateAction<string>>
  setCalendar: Dispatch<SetStateAction<string>>
  toTimezone: (timezone: string) => TemporalZonedDateTime
  toCalendar: (calendar: string) => TemporalZonedDateTime
  toPlainDate: () => TemporalPlainDate
  toPlainTime: () => TemporalPlainTime
  toPlainDateTime: () => TemporalPlainDateTime
  format: (options?: Intl.DateTimeFormatOptions) => string
  add: (duration: TemporalDurationLike | string) => TemporalZonedDateTime
  subtract: (duration: TemporalDurationLike | string) => TemporalZonedDateTime
  compare: (other: TemporalZonedDateTime | string) => number
}

export function useTemporalNow(options?: UseTemporalNowOptions): UseTemporalNowReturn
```

## Source

- VueUse upstream mapping — `source/vueuse/packages/core/useTemporalNow/`:
  [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTemporalNow/index.ts) (implementation),
  [`index.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTemporalNow/index.test.ts) (mirrored to `useTemporalNow.test.tsx`),
  [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTemporalNow/demo.vue) (ported to `demo.tsx` below)
- reaxuse: [`packages/core/src/useTemporalNow.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useTemporalNow.ts), docs + demo co-located in `packages/core/useTemporalNow/`

<Contributors name="useTemporalNow" />
