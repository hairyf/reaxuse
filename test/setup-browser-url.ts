import { afterEach, beforeEach } from 'vitest'

/**
 * The vitest browser runner keys the running file off the iframe URL
 * (`?sessionId=…&iframeId=…`). The history/location tests deliberately rewrite
 * `window.location`, so hand the harness URL back untouched after every test —
 * a dirty iframe URL makes the module mocker lose track of the file whose
 * modules it is serving (it surfaces as `There was an error when mocking a
 * module` and aborts the run).
 */
const harnessUrl = window.location.href

/**
 * WebKit refuses the history-writing APIs beyond 100 calls per 10 seconds
 * **per page** (`SecurityError`), counting `replaceState` and `pushState`
 * together — and the error surfaces as unrelated assertion failures (it is
 * thrown from inside the hook under test), or even as a module-mocker error in
 * a later file. The counter is page-wide while every test file runs in its own
 * iframe, so the calls are recorded on the parent page and each test waits
 * until the window has room.
 */
const HISTORY_BUDGET = 80
const WINDOW_MS = 10_000

interface SharedHistoryCalls { calls: number[] }

const shared: SharedHistoryCalls = (() => {
  try {
    const parent = window.parent as Window & { __reauseHistoryCalls?: SharedHistoryCalls }
    parent.__reauseHistoryCalls ??= { calls: [] }
    return parent.__reauseHistoryCalls
  }
  catch {
    // cross-origin parent: fall back to this frame's own counter
    return { calls: [] }
  }
})()

function recordHistoryCall<T extends (...args: any[]) => any>(method: T): T {
  return function (this: History, ...args: Parameters<T>) {
    shared.calls.push(Date.now())
    return method.apply(this, args)
  } as unknown as T
}

const { replaceState, pushState } = window.history
window.history.replaceState = recordHistoryCall(replaceState.bind(window.history))
window.history.pushState = recordHistoryCall(pushState.bind(window.history))

beforeEach(async () => {
  const now = Date.now()
  while (shared.calls.length && now - shared.calls[0] > WINDOW_MS)
    shared.calls.shift()

  if (shared.calls.length >= HISTORY_BUDGET) {
    await new Promise(resolve => setTimeout(resolve, WINDOW_MS - (now - shared.calls[0]) + 50))
    shared.calls.length = 0
  }
})

afterEach(() => {
  // `replaceState` is wrapped above, so this restore is accounted for by the
  // budget like any other history write
  window.history.replaceState(null, '', harnessUrl)
})
