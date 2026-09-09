---
category: Time
---

# useTimeAgoIntl

Reactive time ago with i18n supported, built on the browser-native [`Intl.RelativeTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat) API

## Usage

```tsx
import { useTimeAgoIntl } from '@reaxuse/core'

const timeAgoIntl = useTimeAgoIntl(new Date(2021, 0, 1), { locale: 'en' }) // string, auto-updates over time

// also accepts timestamps and date strings
const fromNumber = useTimeAgoIntl(1633036800000)
const fromString = useTimeAgoIntl('2024-01-01T00:00:00.000Z')
```
