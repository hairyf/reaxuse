---
category: Time
---

# useTimeAgoIntl

Reactive time ago with i18n supported, built on the browser-native
[`Intl.RelativeTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat)
API — React port of VueUse's
[`useTimeAgoIntl`](https://vueuse.org/core/useTimeAgoIntl/).

**Mapping:** upstream returns a Vue `computed` refreshed by `useNow`'s
scheduler. This port returns a **plain string**, recomputed on every render;
it re-renders itself every `updateInterval` ms (default `30000`, matching
upstream's default `useIntervalFn(cb, 30_000)`) via the house `useNow`
hook, whose interval is cleaned up on unmount — pass new
`time` values to update the input. Upstream's `controls: true` option is not
ported; raw `Intl.RelativeTimeFormatPart[]` access is available through
[`formatTimeAgoIntlParts`](/core/useTimeAgoIntl/index). The non-reactive
[`formatTimeAgoIntl`](/core/useTimeAgoIntl/index) helper is
mirrored 1:1.

## Usage

```tsx
import { useTimeAgoIntl } from '@reaxuse/core'

const timeAgoIntl = useTimeAgoIntl(new Date(2021, 0, 1), { locale: 'en' }) // string, auto-updates over time

// also accepts timestamps and date strings
const fromNumber = useTimeAgoIntl(1633036800000)
const fromString = useTimeAgoIntl('2024-01-01T00:00:00.000Z')
```

<DemoContainer name="UseTimeAgoIntl" />

## Type Declarations

```ts
export interface TimeAgoUnit {
  name: Intl.RelativeTimeFormatUnit
  ms: number
}

export interface FormatTimeAgoIntlOptions {
  locale?: Intl.UnicodeBCP47LocaleIdentifier | Intl.Locale
  relativeTimeFormatOptions?: Intl.RelativeTimeFormatOptions
  insertSpace?: boolean
  joinParts?: (parts: Intl.RelativeTimeFormatPart[], locale?: Intl.UnicodeBCP47LocaleIdentifier | Intl.Locale) => string
  units?: TimeAgoUnit[]
}

export interface UseTimeAgoIntlOptions extends FormatTimeAgoIntlOptions {
  updateInterval?: number
}

export function formatTimeAgoIntl(from: Date, options?: FormatTimeAgoIntlOptions, now?: Date | number): string
export function formatTimeAgoIntlParts(parts: Intl.RelativeTimeFormatPart[], options?: FormatTimeAgoIntlOptions): string
export function useTimeAgoIntl(time: Date | number | string, options?: UseTimeAgoIntlOptions): string
```

## Source

- VueUse: [`packages/core/useTimeAgoIntl`](https://github.com/vueuse/vueuse/tree/main/packages/core/useTimeAgoIntl) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTimeAgoIntl/index.ts), tests [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTimeAgoIntl/index.browser.test.ts), demo [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTimeAgoIntl/demo.vue) mirrored in [`packages/core/src/useTimeAgoIntl.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useTimeAgoIntl.test.tsx)
- reaxuse: [`packages/core/src/useTimeAgoIntl.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useTimeAgoIntl.ts), docs + demo co-located in `packages/core/useTimeAgoIntl/`

<Contributors name="useTimeAgoIntl" />
