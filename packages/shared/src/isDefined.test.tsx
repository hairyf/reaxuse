import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { isDefined } from './isDefined'

describe('isDefined', () => {
  it('should be defined', () => {
    expect(isDefined).toBeDefined()
  })

  it('should support refs', async () => {
    const { result } = await renderHook(() => ({
      defined: useRef('test'),
      empty: useRef<string | undefined>(undefined),
      nullish: useRef<string | null>(null),
    }))

    expect(isDefined(result.current.defined)).toBe(true)
    expect(isDefined(result.current.empty)).toBe(false)
    expect(isDefined(result.current.nullish)).toBe(false)
  })

  it('should support plain ref-like objects', () => {
    // React has no `computed` refs — upstream's computed case maps to any
    // `{ current }` holder, which the guard accepts like `useRef` results
    expect(isDefined({ current: 'test' })).toBe(true)
    expect(isDefined({ current: undefined })).toBe(false)
    expect(isDefined({ current: null })).toBe(false)
  })

  it('should support values', () => {
    const definedValue = 'test'
    const undefinedValue = undefined
    const nullValue = null

    expect(isDefined(definedValue)).toBe(true)
    expect(isDefined(undefinedValue)).toBe(false)
    expect(isDefined(nullValue)).toBe(false)
  })

  it('should narrow `.current` after the guard', () => {
    const example = { current: Math.random() > 0.5 ? 'example' as const : undefined }

    if (isDefined(example)) {
      // compiles only when the guard narrows `.current`
      const narrowed: string = example.current
      expect(narrowed).toBe('example')
    }
    else {
      expect(example.current).toBeUndefined()
    }
  })
})
