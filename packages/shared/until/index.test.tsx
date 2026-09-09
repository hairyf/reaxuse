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
    const v1 = { value: 0 }
    const v2 = { value: 0 }

    const pending1 = until(() => v1.value).toBe(1)
    const pending2 = until(() => v2.value).toBe(2)

    setTimeout(() => {
      v1.value = 1
      v2.value = 1
    }, 110)
    setTimeout(() => {
      v2.value = 2
    }, 220)
    vi.advanceTimersByTime(300)

    expect(await pending1).toBe(1)
    expect(await pending2).toBe(2)
  })

  it('should toBeTruthy', async () => {
    const v = { value: false }
    setTimeout(() => {
      v.value = true
    }, 110)
    vi.advanceTimersByTime(150)

    expect(await until(() => v.value).toBeTruthy()).toBe(true)
  })

  it('should toBeUndefined', async () => {
    const v = { value: false as boolean | undefined }
    setTimeout(() => {
      v.value = undefined
    }, 110)
    vi.advanceTimersByTime(150)

    expect(await until(() => v.value).toBeUndefined()).toBeUndefined()
  })

  it('should toBeNaN', async () => {
    const v = { value: 0 }
    setTimeout(() => {
      v.value = Number.NaN
    }, 110)
    vi.advanceTimersByTime(150)

    expect(await until(() => v.value).toBeNaN()).toBeNaN()
  })

  it('should toBe timeout with a getter source', async () => {
    vi.useRealTimers()
    const v = { value: 0 }
    const reject = vi.fn()
    await until(() => v.value).toBe(1, { timeout: 200, throwOnTimeout: true }).catch(reject)

    expect(reject).toHaveBeenCalledWith('Timeout')
  })

  it('should work for changedTimes', async () => {
    {
      const v = { value: 0 }

      const pending = until(() => v.value).changed()
      setTimeout(() => {
        v.value = 1
      }, 110)
      vi.advanceTimersByTime(200)

      const x = await pending
      expect(x).toBe(1)
    }
    {
      const v = { value: 0 }

      const pending = until(() => v.value).changedTimes(3)
      setTimeout(() => {
        v.value = 1
      }, 110)
      setTimeout(() => {
        v.value = 2
      }, 220)
      setTimeout(() => {
        v.value = 3
      }, 330)
      vi.advanceTimersByTime(400)

      const x = await pending
      expect(x).toBe(3)
    }
  })

  it('should support `not`', async () => {
    const v = { value: 0 }

    const pending = until(() => v.value).not.toBe(0)
    setTimeout(() => {
      v.value = 1
    }, 110)
    vi.advanceTimersByTime(200)

    expect(await pending).toBe(1)
  })

  it('should support `not` as separate instances', async () => {
    const v = { value: 0 }

    const instance = until(() => v.value)
    const xPending = instance.not.toBe(0)
    setTimeout(() => {
      v.value = 1
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
    const v = { value: null as number | null }

    const pending = until(() => v.value).not.toBeNull()
    setTimeout(() => {
      v.value = 1
    }, 110)
    vi.advanceTimersByTime(200)

    expect(await pending).toBe(1)
  })

  it('should support array', async () => {
    const arr = [1, 2, 3]

    const pending = until(() => arr).toContains(4, { deep: true })
    setTimeout(() => {
      arr.push(4)
    }, 110)
    vi.advanceTimersByTime(200)

    expect(await pending).toEqual([1, 2, 3, 4])
  })

  it('should support array with not', async () => {
    const arr = [1, 2, 3]

    const pending = until(() => arr).not.toContains(2, { deep: true })
    setTimeout(() => {
      arr.pop()
      arr.pop()
    }, 110)
    vi.advanceTimersByTime(200)

    expect(await pending).toEqual([1])
  })

  it('should immediately timeout', async () => {
    vi.useRealTimers()
    const v = { value: 0 }

    await until(() => v.value).toBe(1, { timeout: 0 })
  })

  it('should accept a plain value source', async () => {
    expect(await until(1).toBe(1)).toBe(1)
  })

  it('should accept a plain array source', async () => {
    expect(await until([1, 2, 3]).toContains(2)).toEqual([1, 2, 3])
  })

  it('should type check', () => {
    /* eslint-disable ts/no-unused-expressions */
    async () => {
      const xv = { value: 'x' as 'x' | undefined }
      const x: () => 'x' | undefined = () => xv.value
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

      const yv = { value: 'y' as 'y' | null }
      const y: () => 'y' | null = () => yv.value
      const _yNull = await until(y).toBeNull()
      'test' as any as Expect<Equal<typeof _yNull, null>>

      const _yNotNull = await until(y).not.toBeNull()
      'test' as any as Expect<Equal<typeof _yNotNull, 'y'>>

      const zv = { value: 1 as 1 | 2 | 3 }
      const z: () => 1 | 2 | 3 = () => zv.value
      const is1 = (x: number): x is 1 => x === 1

      const _z1 = await until(z).toMatch(is1)
      'test' as any as Expect<Equal<typeof _z1, 1>>

      const _zNot1 = await until(z).not.toMatch(is1)
      'test' as any as Expect<Equal<typeof _zNot1, 2 | 3>>
    }
    /* eslint-enable ts/no-unused-expressions */
  })
})
