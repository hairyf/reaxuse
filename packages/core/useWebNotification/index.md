---
category: Browser
---

# useWebNotification

Reactive [Notification](https://developer.mozilla.org/en-US/docs/Web/API/notification). The Web Notification interface of the Notifications API is used to configure and display desktop notifications to the user.

## Usage

::: tip
Before an app can send a notification, the user must grant the application the right to do so. The user's OS settings may also prevent expected notification behaviour.
:::

```tsx
import { useWebNotification } from '@reaxuse/core'
import { useEffect } from 'react'

const {
  isSupported,
  notification,
  permissionGranted,
  show,
  close,
  onClick,
  onShow,
  onError,
  onClose,
} = useWebNotification({
  title: 'Hello, reaxuse world!',
  dir: 'auto',
  lang: 'en',
  renotify: true,
  tag: 'test',
})

useEffect(() => {
  if (isSupported && permissionGranted)
    show()
}, [isSupported, permissionGranted, show])
```

The on* members are stable subscribe functions returning an `off` handle:

```tsx
const { onClick, onShow, onError, onClose } = useWebNotification()

onClick((event) => {
  // Do something with the notification on:click event...
})

onShow((event) => {
  // Do something with the notification on:show event...
})

onError((event) => {
  // Do something with the notification on:error event...
})

onClose((event) => {
  // Do something with the notification on:close event...
})
```
