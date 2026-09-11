import * as core from '@reause/core'
import * as integrations from '@reause/integrations'
import * as math from '@reause/math'
import * as metadata from '@reause/metadata'
import * as shared from '@reause/shared'
import { describe, expect, it } from 'vitest'

describe('@reause/core exports', () => {
  it('exposes the ported hooks', () => {
    expect(core.useNow).toBeTypeOf('function')
  })
  it('re-exports @reause/shared (mirrors `export * from \'@vueuse/shared\'`)', () => {
    expect(core.noop).toBeTypeOf('function')
    expect(core.useToggle).toBeTypeOf('function')
    expect(core.useCounter).toBeTypeOf('function')
    expect(core.useDebounceFn).toBeTypeOf('function')
  })
})

describe('@reause/shared exports', () => {
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
  it('@reause/math', () => {
    expect(math).toBeDefined()
  })
  it('@reause/integrations', () => {
    expect(integrations).toBeDefined()
  })
  it('@reause/metadata', () => {
    expect(metadata).toBeDefined()
  })
})
