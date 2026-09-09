import type { Rules } from 'async-validator'
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useAsyncValidator } from './useAsyncValidator'

// upstream uses `suppressWarning: true` for the failing cases so async-validator
// does not print console warnings during the browser test run
const failingRules: Rules = {
  name: {
    type: 'string',
    min: 5,
    max: 20,
    message: 'name length must be 5-20',
  },
  age: {
    type: 'number',
  },
}

const passingRules: Rules = {
  name: {
    type: 'string',
  },
  age: {
    type: 'number',
  },
}

const expectedNameError = [
  {
    field: 'name',
    fieldValue: 'jelf',
    message: 'name length must be 5-20',
  },
]

// the validated value must keep a STABLE identity across renders — a fresh
// object literal per render would re-trigger the automatic validation on every
// render (React has no deep observation; see the JSDoc of the hook)
function createForm() {
  return {
    name: 'jelf',
    age: 24,
  }
}

const form = createForm()

describe('useAsyncValidator', () => {
  it('should be defined', () => {
    expect(useAsyncValidator).toBeDefined()
  })

  it('should pass', async () => {
    const { result } = await renderHook(() => useAsyncValidator(form, passingRules))
    await vi.waitFor(() => expect(result.current.isFinished).toBe(true))

    expect(result.current.pass).toBe(true)
    expect(result.current.errors).toMatchObject([])
    expect(result.current.errorInfo).toBeNull()
    expect(result.current.errorFields).toMatchObject({})
  })

  it('should async', async () => {
    const { result } = await renderHook(() => useAsyncValidator(form, passingRules))

    // the initial validation runs from a mount effect; unlike Vue (where setup
    // returns before the watcher's promise settles), `renderHook` awaits `act`,
    // so the synchronous `isFinished = false` window has already closed here
    await vi.waitFor(() => expect(result.current.isFinished).toBe(true))
    expect(result.current.pass).toBe(true)
    expect(result.current.errors).toMatchObject([])
  })

  it('immediate should can be work', async () => {
    const { result } = await renderHook(() => useAsyncValidator(form, passingRules, { immediate: false }))

    expect(result.current.isFinished).toBe(true)
    expect(result.current.pass).toBe(true)
    expect(result.current.errors).toMatchObject([])
  })

  it('execute should can be work', async () => {
    const { result } = await renderHook(() => useAsyncValidator(form, passingRules, { immediate: false }))
    const snapshot = await result.current.execute()

    expect(snapshot.pass).toBe(true)
    expect(snapshot.errors).toMatchObject([])
    expect(snapshot.errorInfo).toBeNull()
    expect(snapshot.errorFields).toMatchObject({})
    // `execute` resolves before React commits the state it queued — poll for it
    await vi.waitFor(() => expect(result.current.pass).toBe(true))
    expect(result.current.isFinished).toBe(true)
  })

  it('should can be await', async () => {
    const { result } = await renderHook(() => useAsyncValidator(form, passingRules))
    const shell = await result.current

    expect(shell.pass).toBe(true)
    expect(shell.errors).toMatchObject([])
    expect(shell.isFinished).toBe(true)
    expect(result.current.isFinished).toBe(true)
  })

  it('should fail to validate', async () => {
    const { result } = await renderHook(() => useAsyncValidator(form, failingRules, {
      validateOption: {
        suppressWarning: true,
      },
    }))
    await vi.waitFor(() => expect(result.current.isFinished).toBe(true))

    expect(result.current.pass).toBe(false)
    expect(result.current.errors).toMatchObject(expectedNameError)
    expect(result.current.errorFields.name).toMatchObject(expectedNameError)
  })

  it('should fail to validate when use execute', async () => {
    const { result } = await renderHook(() => useAsyncValidator(form, failingRules, {
      validateOption: {
        suppressWarning: true,
      },
      immediate: false,
    }))

    const snapshot = await result.current.execute()

    expect(snapshot.pass).toBe(false)
    expect(snapshot.errors).toMatchObject(expectedNameError)
    expect(snapshot.errorFields?.name).toMatchObject(expectedNameError)
    await vi.waitFor(() => expect(result.current.pass).toBe(false))
    expect(result.current.errors).toMatchObject(expectedNameError)
  })

  it('should validate on a new value identity', async () => {
    let input = createForm()
    const { result, rerender } = await renderHook(() => useAsyncValidator(input, failingRules, {
      validateOption: {
        suppressWarning: true,
      },
    }))
    await vi.waitFor(() => expect(result.current.pass).toBe(false))

    input = { name: 'okxiaoliang4', age: 24 }
    await rerender()
    await vi.waitFor(() => expect(result.current.pass).toBe(true))

    expect(result.current.errors).toMatchObject([])
    expect(result.current.errorFields).toMatchObject({})
  })

  it('does not re-validate when the same object is mutated in place (no deep watch in React)', async () => {
    const input = createForm()
    const { result, rerender } = await renderHook(() => useAsyncValidator(input, failingRules, {
      validateOption: {
        suppressWarning: true,
      },
    }))
    await vi.waitFor(() => expect(result.current.pass).toBe(false))

    input.name = 'okxiaoliang4'
    await rerender()

    // identity unchanged → the effect does not re-run; call `execute()` instead
    expect(result.current.pass).toBe(false)
    expect(result.current.errors).toMatchObject(expectedNameError)

    await result.current.execute()
    await vi.waitFor(() => expect(result.current.pass).toBe(true))
    expect(result.current.errors).toMatchObject([])
  })

  it('follows a ref-like value object', async () => {
    const value = { current: createForm() }
    const { result, rerender } = await renderHook(() => useAsyncValidator(value, failingRules, {
      validateOption: {
        suppressWarning: true,
      },
    }))
    await vi.waitFor(() => expect(result.current.pass).toBe(false))
    expect(result.current.errors).toMatchObject(expectedNameError)

    value.current = { name: 'okxiaoliang4', age: 24 }
    await rerender()
    await vi.waitFor(() => expect(result.current.pass).toBe(true))

    expect(result.current.errors).toMatchObject([])
  })
})

describe('set manual true', () => {
  it('set immediate and manual at the same time', async () => {
    const { result } = await renderHook(() => useAsyncValidator(form, failingRules, { immediate: false, manual: true }))

    expect(result.current.pass).toBe(true)
    expect(result.current.errors).toMatchObject([])

    const shell = await result.current
    expect(shell.pass).toBe(true)
    expect(shell.errors).toMatchObject([])
  })

  it('set manual, do not run validator automatically', async () => {
    const { result } = await renderHook(() => useAsyncValidator(form, failingRules, { manual: true }))

    expect(result.current.pass).toBe(true)
    expect(result.current.errors).toMatchObject([])

    // no validation ran, so the promise-like is already settled
    const shell = await result.current
    expect(shell.pass).toBe(true)
    expect(shell.errors).toMatchObject([])
  })

  it('manual trigger validator', async () => {
    const value = { current: createForm() }
    const { result } = await renderHook(() => useAsyncValidator(value, failingRules, {
      manual: true,
      validateOption: { suppressWarning: true },
    }))

    expect(result.current.pass).toBe(true)
    expect(result.current.errors).toMatchObject([])

    // first trigger
    await result.current.execute()
    await vi.waitFor(() => expect(result.current.pass).toBe(false))
    expect(result.current.errors).toMatchObject(expectedNameError)

    // second trigger
    value.current = { name: 'okxiaoliang4', age: 24 }
    await result.current.execute()
    await vi.waitFor(() => expect(result.current.pass).toBe(true))
    expect(result.current.errors).toMatchObject([])
  })
})
