---
category: '@Firebase'
---

# useAuth

Reactive [Firebase Auth](https://firebase.google.com/docs/auth) binding. It provides a controllable `user` state and `isAuthenticated` flag so you
can easily react to changes in the users' authentication status.

## Usage

```tsx
import { useAuth } from '@reause/firebase'
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const app = initializeApp({ /* config */ })
const auth = getAuth(app)

function Profile() {
  // 1. 直接传入 auth 实例
  const { isAuthenticated, user, loading, error } = useAuth(auth)

  if (loading)
    return <div>Loading...</div>
  if (error)
    return <div>{`Auth error: ${error.message}`}</div>
  if (!isAuthenticated)
    return <div>Please log in</div>

  return <div>{`Welcome, ${user?.displayName}`}</div>
}

const signIn = () => signInWithPopup(auth, new GoogleAuthProvider())
```

## Return Values

| Name              | Type            | Description                                                                                        |
| ----------------- | --------------- | -------------------------------------------------------------------------------------------------- |
| `user`            | `User \| null`  | The current Firebase user, or `null` if not authenticated                                          |
| `isAuthenticated` | `boolean`       | Whether a user is currently authenticated                                                          |
| `loading`         | `boolean`       | Whether the auth state is still being resolved — `true` until `onIdTokenChanged` reports the state |
| `error`           | `Error \| null` | The error thrown while subscribing to `onIdTokenChanged`, or `null`                                |

The hook automatically updates when the user's ID token changes (including sign-in, sign-out, and token refresh events) using Firebase's `onIdTokenChanged` listener.
