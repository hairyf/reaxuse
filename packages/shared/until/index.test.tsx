import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { until } from '../until'

// type-level helpers (upstream imports these from @type-challenges/utils,
// which reaxuse does not depend on)
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false
type Expect<T extends true> = T

describe('until', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should toBe', async () => {
    const r1 = { current: 0 }
    const r2 = { current: 0 }

    const pending1 = until(r1).toBe(1)
    const pending2 = until(r2).toBe({ current: 2 })

    setTimeout(() => {
      r1.current = 1
      r2.current = 1
    }, 110)
    setTimeout(() => {
      r2.current = 2
    }, 220)
    vi.advanceTimersByTime(300)

    expect(await pending1).toBe(1)
    expect(await pending2).toBe(2)
  })

  it('should toBeTruthy', async () => {
    const r = { current: false }
    setTimeout(() => {
      r.current = true
    }, 110)
    vi.advanceTimersByTime(150)

    expect(await until(r).toBeTruthy()).toBe(true)
  })

  it('should toBeUndefined', async () => {
    const r = { current: false as boolean | undefined }
    setTimeout(() => {
      r.current = undefined
    }, 110)
    vi.advanceTimersByTime(150)

    expect(await until(r).toBeUndefined()).toBeUndefined()
  })

  it('should toBeNaN', async () => {
    const r = { current: 0 }
    setTimeout(() => {
      r.current = Number.NaN
    }, 110)
    vi.advanceTimersByTime(150)

    expect(await until(r).toBeNaN()).toBeNaN()
  })

  it('should toBe timeout with ref', async () => {
    vi.useRealTimers()
    const r = { current: 0 }
    const reject = vi.fn()
    await until(r).toBe({ current: 1 }, { timeout: 200, throwOnTimeout: true }).catch(reject)

    expect(reject).toHaveBeenCalledWith('Timeout')
  })

  it('should work for changedTimes', async () => {
    {
      const r = { current: 0 }

      const pending = until(r).changed()
      setTimeout(() => {
        r.current = 1
      }, 110)
      vi.advanceTimersByTime(200)

      const x = await pending
      expect(x).toBe(1)
    }
    {
      const r = { current: 0 }

      const pending = until(r).changedTimes(3)
      setTimeout(() => {
        r.current = 1
      }, 110)
      setTimeout(() => {
        r.current = 2
      }, 220)
      setTimeout(() => {
        r.current = 3
      }, 330)
      vi.advanceTimersByTime(400)

      const x = await pending
      expect(x).toBe(3)
    }
  })

  it('should support `not`', async () => {
    const r = { current: 0 }

    const pending = until(r).not.toBe(0)
    setTimeout(() => {
      r.current = 1
    }, 110)
    vi.advanceTimersByTime(200)

    expect(await pending).toBe(1)
  })

  it('should support `not` as separate instances', async () => {
    const r = { current: 0 }

    const instance = until(r)
    const xPending = instance.not.toBe(0)
    setTimeout(() => {
      r.current = 1
    }, 110)
    vi.advanceTimersByTime(200)

    const x = await xPending
    expect(x).toBe(1)

    // the second `.not` instance is created after the value already changed,
    // so its immediate check passes
    const y = await instance.not.toBe(2)
    expect(y).toBe(1)
  })

  it('should support toBeNull()', async () => {
    const r = { current: null as number | null }

    const pending = until(r).not.toBeNull()
    setTimeout(() => {
      r.current = 1
    }, 110)
    vi.advanceTimersByTime(200)

    expect(await pending).toBe(1)
  })

  it('should support array', async () => {
    const r = { current: [1, 2, 3] }

    const pending = until(r).toContains(4, { deep: true })
    setTimeout(() => {
      r.current.push(4)
    }, 110)
    vi.advanceTimersByTime(200)

    expect(await pending).toEqual([1, 2, 3, 4])
  })

  it('should support array with not', async () => {
    const r = { current: [1, 2, 3] }

    const pending = until(r).not.toContains(2, { deep: true })
    setTimeout(() => {
      r.current.pop()
      r.current.pop()
    }, 110)
    vi.advanceTimersByTime(200)

    expect(await pending).toEqual([1])
  })

  it('should immediately timeout', async () => {
    vi.useRealTimers()
    const r = { current: 0 }

    await until(r).toBe(1, { timeout: 0 })
  })

  it('should type check', () => {
    /* eslint-disable ts/no-unused-expressions */
    async () => {
      const x = { current: 'x' as 'x' | undefined }
      // type checks are done this way to prevent unused variable warnings
      // and duplicate name warnings

      const _one = await until(x).toBe(1 as const)
      'test' as any as Expect<Equal<typeof _one, 1>>

      const _xTruthy = await until(x).toBeTruthy()
      'test' as any as Expect<Equal<typeof _xTruthy, 'x'>>

      const _xFalsy = await until(x).not.toBeTruthy()
      'test' as any as Expect<Equal<typeof _xFalsy, undefined>>

      const _xUndef = await until(x).toBeUndefined()
      'test' as any as Expect<Equal<typeof _xUndef, undefined>>

      const _xNotUndef = await until(x).not.toBeUndefined()
      'test' as any as Expect<Equal<typeof _xNotUndef, 'x'>>

      const y = { current: 'y' as 'y' | null }
      const _yNull = await until(y).toBeNull()
      'test' as any as Expect<Equal<typeof _yNull, null>>

      const _yNotNull = await until(y).not.toBeNull()
      'test' as any as Expect<Equal<typeof _yNotNull, 'y'>>

      const z = { current: 1 as 1 | 2 | 3 }
      const is1 = (x: number): x is 1 => x === 1

      const _z1 = await until(z).toMatch(is1)
      'test' as any as Expect<Equal<typeof _z1, 1>>

      const _zNot1 = await until(z).not.toMatch(is1)
      'test' as any as Expect<Equal<typeof _zNot1, 2 | 3>>
    }
    /* eslint-enable ts/no-unused-expressions */
  })
})
