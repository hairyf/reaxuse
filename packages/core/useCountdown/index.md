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

### Options

| Option       | Type         | Default | Description                                                  |
| ------------ | ------------ | ------- | ------------------------------------------------------------ |
| `interval`   | `number`     | `1000`  | Countdown interval in milliseconds (reaxuse-only, see below) |
| `onComplete` | `() => void` | —       | Callback function called when the countdown reaches 0        |
| `onTick`     | `() => void` | —       | Callback function called on each tick of the countdown       |

### Return Values

| Property    | Type                                       | Description                                             |
| ----------- | ------------------------------------------ | ------------------------------------------------------- |
| `remaining` | `number`                                   | Current countdown value (upstream: a shallow ref)       |
| `reset`     | `(countdown?: RefOrValue<number>) => void` | Reset the countdown to its initial value                |
| `stop`      | `() => void`                               | Stop the countdown and reset its state                  |
| `start`     | `(countdown?: RefOrValue<number>) => void` | Reset the countdown and start it again                  |
| `pause`     | `() => void`                               | Pause the countdown — `remaining` stays put             |
| `resume`    | `() => void`                               | Resume a paused countdown (no-op at 0 or while running) |
| `isActive`  | `boolean`                                  | Whether the countdown interval is currently active      |

## React divergences

- The Vue shallow refs become plain values on the result object: `remaining` is a `number` and `isActive` is a `boolean` (no `.value`).
- Upstream accepts a `scheduler` option (`UseCountdownOptions extends ConfigurableScheduler`, defaulting to `useIntervalFn(cb, 1000, { immediate: false })`). There is no React equivalent, so `scheduler` is not ported; the reaxuse-only `interval` option sets the tick rate instead (default `1000` ms, matching upstream's default scheduler).
- A plain-number `initialCountdown` is captured once at setup, like upstream's `toValue(initialCountdown)` closure — a later no-arg `start()`/`reset()` keeps using the setup value. Pass a ref-like `{ current }` to read the latest value.
- `start()`/`resume()` begin the interval from event handlers/effects only, so no timers run during SSR.
