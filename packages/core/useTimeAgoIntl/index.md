---
category: Time
utils: formatTimeAgoIntl
---

# useTimeAgoIntl

Reactive time ago with i18n supported. Automatically update the time ago string when the time changes. Powered by `Intl.RelativeTimeFormat`.

## Usage

```tsx
import { useTimeAgoIntl } from '@reaxuse/core'

const timeAgoIntl = useTimeAgoIntl(new Date(2021, 0, 1), { locale: 'en' }) // string, auto-updates over time

// also accepts timestamps and date strings
const fromNumber = useTimeAgoIntl(1633036800000)
const fromString = useTimeAgoIntl('2024-01-01T00:00:00.000Z')
```

## Non-Reactivity Usage

In case you don't need the reactivity, you can use the `formatTimeAgoIntl` function to get the formatted string instead of a controllable state.

```tsx
import { formatTimeAgoIntl } from '@reaxuse/core'

const timeAgoIntl = formatTimeAgoIntl(new Date(2021, 0, 1)) // string
```
