import type { Options } from 'change-case'
import type { ChangeCaseType } from '../useChangeCase'
import { describe, expect, it } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useChangeCase } from '../useChangeCase'

describe('useChangeCase', () => {
  interface ObjectValue {
    helloWorld: string
    vueuse: string
    delimiterHelloWorld: string
    delimiterVueuse: string
  }
  // upstream omits camelCase from the delimiter matrix — it is covered by its
  // own base test below (in change-case@5 the delimiter option does change
  // camelCase's output, e.g. camelCase('helloWorld', { delimiter: '-' }) → 'hello-World')
  type ObjectTypes = Omit<Record<ChangeCaseType, ObjectValue>, 'camelCase'>
  const helloWorld = 'helloWorld'
  const vueuse = 'vue use'
  const obj: ObjectTypes = {
    capitalCase: {
      helloWorld: 'Hello World',
      vueuse: 'Vue Use',
      delimiterHelloWorld: 'Hello-World',
      delimiterVueuse: 'Vue-Use',
    },
    constantCase: {
      helloWorld: 'HELLO_WORLD',
      vueuse: 'VUE_USE',
      delimiterHelloWorld: 'HELLO-WORLD',
      delimiterVueuse: 'VUE-USE',
    },
    dotCase: {
      helloWorld: 'hello.world',
      vueuse: 'vue.use',
      delimiterHelloWorld: 'hello-world',
      delimiterVueuse: 'vue-use',
    },
    trainCase: {
      helloWorld: 'Hello-World',
      vueuse: 'Vue-Use',
      delimiterHelloWorld: 'Hello-World',
      delimiterVueuse: 'Vue-Use',
    },
    noCase: {
      helloWorld: 'hello world',
      vueuse: 'vue use',
      delimiterHelloWorld: 'hello-world',
      delimiterVueuse: 'vue-use',
    },
    kebabCase: {
      helloWorld: 'hello-world',
      vueuse: 'vue-use',
      delimiterHelloWorld: 'hello-world',
      delimiterVueuse: 'vue-use',
    },
    pascalCase: {
      helloWorld: 'HelloWorld',
      vueuse: 'VueUse',
      delimiterHelloWorld: 'Hello-World',
      delimiterVueuse: 'Vue-Use',
    },
    pascalSnakeCase: {
      helloWorld: 'Hello_World',
      vueuse: 'Vue_Use',
      delimiterHelloWorld: 'Hello-World',
      delimiterVueuse: 'Vue-Use',
    },
    pathCase: {
      helloWorld: 'hello/world',
      vueuse: 'vue/use',
      delimiterHelloWorld: 'hello-world',
      delimiterVueuse: 'vue-use',
    },
    sentenceCase: {
      helloWorld: 'Hello world',
      vueuse: 'Vue use',
      delimiterHelloWorld: 'Hello-world',
      delimiterVueuse: 'Vue-use',
    },
    snakeCase: {
      helloWorld: 'hello_world',
      vueuse: 'vue_use',
      delimiterHelloWorld: 'hello-world',
      delimiterVueuse: 'vue-use',
    },
  }

  ;(Object.keys(obj) as Array<keyof ObjectTypes>).forEach((key) => {
    it(`base ${key}`, async () => {
      const { result, act } = await renderHook(() => useChangeCase(helloWorld, key))

      expect(result.current[0]).toBe(obj[key].helloWorld)

      await act(() => {
        result.current[1](vueuse)
      })

      expect(result.current[0]).toBe(obj[key].vueuse)
    })

    it(`prop change ${key}`, async () => {
      const { result, rerender } = await renderHook(
        ({ input }: { input: string } = { input: helloWorld }) => useChangeCase(input, key),
        { initialProps: { input: helloWorld } },
      )

      expect(result.current[0]).toBe(obj[key].helloWorld)

      await rerender({ input: vueuse })
      expect(result.current[0]).toBe(obj[key].vueuse)
    })

    it(`options ${key}`, async () => {
      const options: Options = {
        delimiter: '-',
      }
      const { result, act } = await renderHook(() => useChangeCase(helloWorld, key, options))

      expect(result.current[0]).toBe(obj[key].delimiterHelloWorld)

      await act(() => {
        result.current[1](vueuse)
      })

      expect(result.current[0]).toBe(obj[key].delimiterVueuse)
    })
  })

  it('camelCase base usage', async () => {
    const { result, act } = await renderHook(() => useChangeCase('hello world', 'camelCase'))

    expect(result.current[0]).toBe('helloWorld')

    await act(() => {
      result.current[1]('vue use')
    })

    expect(result.current[0]).toBe('vueUse')
  })

  it('re-transforms when the type changes', async () => {
    const { result, rerender } = await renderHook(
      ({ type }: { type?: ChangeCaseType } = {}) => useChangeCase('helloWorld', type ?? 'camelCase'),
      { initialProps: { type: 'camelCase' as ChangeCaseType } },
    )

    expect(result.current[0]).toBe('helloWorld')

    await rerender({ type: 'snakeCase' })
    expect(result.current[0]).toBe('hello_world')

    await rerender({ type: 'constantCase' })
    expect(result.current[0]).toBe('HELLO_WORLD')
  })

  it('follows a changed input prop (upstream: computed changes along with the source)', async () => {
    const { result, rerender } = await renderHook(
      ({ input }: { input: string } = { input: helloWorld }) => useChangeCase(input, 'kebabCase'),
      { initialProps: { input: helloWorld } },
    )

    expect(result.current[0]).toBe('hello-world')

    await rerender({ input: vueuse })

    expect(result.current[0]).toBe('vue-use')
  })

  it('forwards options (locale)', async () => {
    const { result } = await renderHook(() => useChangeCase('istanbul', 'capitalCase', { locale: 'tr' }))

    expect(result.current[0]).toBe('İstanbul')
  })

  it('keeps a setValue write when the input prop did not change', async () => {
    const { result, act, rerender } = await renderHook(
      ({ input }: { input: string } = { input: helloWorld }) => useChangeCase(input, 'kebabCase'),
      { initialProps: { input: helloWorld } },
    )

    await act(() => {
      result.current[1](vueuse)
    })
    expect(result.current[0]).toBe('vue-use')

    // the prop is unchanged, so the sync effect must not clobber the write
    await rerender({ input: helloWorld })
    expect(result.current[0]).toBe('vue-use')
  })
})
