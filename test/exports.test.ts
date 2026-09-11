import * as core from '@reaxuse/core'
import * as integrations from '@reaxuse/integrations'
import * as math from '@reaxuse/math'
import * as metadata from '@reaxuse/metadata'
import * as shared from '@reaxuse/shared'
import { describe, expect, it } from 'vitest'

describe('@reaxuse/core exports', () => {
  it('exposes the ported hooks', () => {
    expect(core.useNow).toBeTypeOf('function')
  })
  it('re-exports @reaxuse/shared (mirrors `export * from \'@vueuse/shared\'`)', () => {
    expect(core.noop).toBeTypeOf('function')
    expect(core.useToggle).toBeTypeOf('function')
    expect(core.useCounter).toBeTypeOf('function')
    expect(core.useDebounceFn).toBeTypeOf('function')
  })
})

describe('@reaxuse/shared exports', () => {
  it('exposes shared utilities', () => {
    expect(shared.noop).toBeTypeOf('function')
    expect(shared.isClient).toBeTypeOf('boolean')
  })
  it('exposes the hooks mapped from @vueuse/shared', () => {
    expect(shared.useToggle).toBeTypeOf('function')
    expect(shared.useCounter).toBeTypeOf('function')
  })
})

describe('skeleton packages are importable', () => {
  it('@reaxuse/math', () => {
    expect(math).toBeDefined()
  })
  it('@reaxuse/integrations', () => {
    expect(integrations).toBeDefined()
  })
  it('@reaxuse/metadata', () => {
    expect(metadata).toBeDefined()
  })
})
