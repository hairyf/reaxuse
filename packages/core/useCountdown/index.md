---
category: Time
---

# useCountdown

Reactive countdown timer in seconds

## Usage

```tsx
import { useCountdown } from '@reaxuse/core'

const countdownSeconds = 5
const { remaining, start, stop, pause, resume } = useCountdown(countdownSeconds, {
  onComplete() {

  },
  onTick() {

  },
})

start() // begins counting down from 5
```

The initial countdown can also be a React ref,
and `start()`/`reset()` accept a new countdown value for the next countdown.

```tsx
import { useCountdown } from '@reaxuse/core'

const countdown = { current: 5 }
const { start, reset } = useCountdown(countdown)

// change the countdown value
countdown.current = 10

// start a new countdown with 2 seconds
start(2)

// reset the countdown to 4, but do not start it
reset(4)

// start the countdown with the current value of `countdown`
start()
```
