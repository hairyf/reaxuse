---
category: Time
---

# useDateFormat

Get the formatted date according to the string of tokens passed in, inspired by [dayjs](https://github.com/iamkun/dayjs)

## Usage

```tsx
import { useDateFormat } from '@reaxuse/shared'

const formatted = useDateFormat(new Date(), 'YYYY-MM-DD HH:mm:ss')

const localized = useDateFormat(new Date(), 'YYYY-MM-DD (ddd)', { locales: 'en-US' })
```

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
