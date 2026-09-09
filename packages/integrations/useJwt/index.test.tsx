import type { JwtHeader, JwtPayload } from 'jwt-decode'
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from 'vitest-browser-react'
import { useJwt } from '../useJwt'

interface CustomJwtHeader extends JwtHeader {
  foo: string
}

interface CustomJwtPayload extends JwtPayload {
  foo: string
}

const encodedJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.L8i6g3PfcHlioHCCPURC9pmXT7gdJpx3kOoyAfNUwCc'
const encodedCustomJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImZvbyI6ImJhciJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJmb28iOiJiYXIifQ.S5QwvREUfgEdpB1ljG_xN6NI3HubQ79xx6J1J4dsJmg'

describe('useJwt', () => {
  it('decoded jwt', async () => {
    const { result } = await renderHook(() => useJwt(encodedJwt))

    expect(result.current.header?.alg).toBe('HS256')
    expect(result.current.header?.typ).toBe('JWT')
    expect(result.current.payload?.sub).toBe('1234567890')
    expect(result.current.payload?.iat).toBe(1516239022)
  })

  it('decode jwt error', async () => {
    const onErrorSpy = vi.fn()

    const { result } = await renderHook(() => useJwt('bad-token', { onError: onErrorSpy }))

    expect(result.current.header).toBe(null)
    expect(result.current.payload).toBe(null)
    expect(onErrorSpy).toHaveBeenCalled()
  })

  it('decoded jwt with custom fields', async () => {
    const { result } = await renderHook(() => useJwt<CustomJwtPayload, CustomJwtHeader>(encodedCustomJwt))

    expect(result.current.header?.foo).toBe('bar')
    expect(result.current.payload?.foo).toBe('bar')
  })

  it('reactivity (upstream: computed follows the source ref)', async () => {
    const { result, rerender } = await renderHook(
      ({ jwt }: { jwt?: string } = {}) => useJwt<CustomJwtPayload, CustomJwtHeader>(jwt ?? encodedJwt),
      { initialProps: { jwt: encodedJwt } },
    )

    expect(result.current.header?.foo).toBeUndefined()
    expect(result.current.payload?.foo).toBeUndefined()

    await rerender({ jwt: encodedCustomJwt })

    expect(result.current.header?.foo).toBe('bar')
    expect(result.current.payload?.foo).toBe('bar')
  })

  it('follows ref-like input changes', async () => {
    const jwt = { current: encodedJwt }
    const { result, rerender } = await renderHook(() => useJwt<CustomJwtPayload, CustomJwtHeader>(jwt))

    expect(result.current.payload?.foo).toBeUndefined()

    jwt.current = encodedCustomJwt
    await rerender()

    expect(result.current.header?.foo).toBe('bar')
    expect(result.current.payload?.foo).toBe('bar')
  })

  it('returns the fallbackValue when decoding fails', async () => {
    const { result } = await renderHook(() => useJwt('bad-token', { fallbackValue: 'fallback' }))

    expect(result.current.header).toBe('fallback')
    expect(result.current.payload).toBe('fallback')
  })
})
