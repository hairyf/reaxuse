---
category: Time
---

# useTimeAgo

Reactive time ago — React port of VueUse's
[`useTimeAgo`](https://vueuse.org/core/useTimeAgo/).

**Mapping:** upstream returns a Vue `computed` refreshed by `useNow`'s
configurable scheduler. This port returns a **plain string**, recomputed on
every render; it re-renders itself every `updateInterval` ms (default `30000`,
matching upstream's default `useIntervalFn(cb, 30_000)`) via the house
`useNow` hook, whose interval is cleaned up on unmount — pass new `time`
values to update the input. Upstream's `controls: true` option (pause/resume)
is not ported; `UseTimeAgoOptions` therefore drops the `Controls` boolean
generic. The non-reactive [`formatTimeAgo`](/core/useTimeAgo/index) helper is mirrored 1:1.

## Usage

```tsx
import { useTimeAgo } from '@reaxuse/core'

const timeAgo = useTimeAgo(new Date(2021, 0, 1)) // string, auto-updates over time

// also accepts timestamps and date strings
const fromNumber = useTimeAgo(1633036800000)
const fromString = useTimeAgo('2024-01-01T00:00:00.000Z')

// show the full date when the diff exceeds `max` (unit name or milliseconds)
const cutoff = useTimeAgo(new Date(2021, 0, 1), { max: 'day' })
```

<DemoContainer name="UseTimeAgo" />

## Type Declarations

```ts
export type UseTimeAgoFormatter<T = number> = (value: T, isPast: boolean) => string

export type UseTimeAgoUnitNamesDefault = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

export interface UseTimeAgoMessagesBuiltIn {
  justNow: string
  past: string | UseTimeAgoFormatter<string>
  future: string | UseTimeAgoFormatter<string>
  invalid: string
}

export type UseTimeAgoMessages<UnitNames extends string = UseTimeAgoUnitNamesDefault>
  = UseTimeAgoMessagesBuiltIn
    & Record<UnitNames, string | UseTimeAgoFormatter<number>>

export interface UseTimeAgoUnit<Unit extends string = UseTimeAgoUnitNamesDefault> {
  max: number
  value: number
  name: Unit
}

export interface FormatTimeAgoOptions<UnitNames extends string = UseTimeAgoUnitNamesDefault> {
  max?: UnitNames | number
  fullDateFormatter?: (date: Date) => string
  messages?: UseTimeAgoMessages<UnitNames>
  showSecond?: boolean
  rounding?: 'round' | 'ceil' | 'floor' | number
  units?: UseTimeAgoUnit<UnitNames>[]
}

export interface UseTimeAgoOptions<UnitNames extends string = UseTimeAgoUnitNamesDefault> extends FormatTimeAgoOptions<UnitNames> {
  updateInterval?: number
}

export function formatTimeAgo<UnitNames extends string = UseTimeAgoUnitNamesDefault>(from: Date, options?: FormatTimeAgoOptions<UnitNames>, now?: Date | number): string
export function useTimeAgo<UnitNames extends string = UseTimeAgoUnitNamesDefault>(time: Date | number | string, options?: UseTimeAgoOptions<UnitNames>): string
```

## Source

- VueUse: [`packages/core/useTimeAgo`](https://github.com/vueuse/vueuse/tree/main/packages/core/useTimeAgo) — source [`index.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTimeAgo/index.ts), tests [`index.browser.test.ts`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTimeAgo/index.browser.test.ts), demo [`demo.vue`](https://github.com/vueuse/vueuse/blob/main/packages/core/useTimeAgo/demo.vue) mirrored in [`packages/core/src/useTimeAgo.test.tsx`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useTimeAgo.test.tsx)
- reaxuse: [`packages/core/src/useTimeAgo.ts`](https://github.com/hairyf/reaxuse/blob/main/packages/core/src/useTimeAgo.ts), docs + demo co-located in `packages/core/useTimeAgo/`

<Contributors name="useTimeAgo" />
