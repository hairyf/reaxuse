import { describe, expect, it } from 'vitest'
import * as core from '@reaxuse/core'
import * as shared from '@reaxuse/shared'
import * as math from '@reaxuse/math'
import * as integrations from '@reaxuse/integrations'
import * as metadata from '@reaxuse/metadata'

describe('@reaxuse/core exports', () => {
  it('exposes the ported hooks', () => {
    expect(core.useToggle).toBeTypeOf('function')
    expect(core.useCounter).toBeTypeOf('function')
    expect(core.useNow).toBeTypeOf('function')
  })
})

describe('@reaxuse/shared exports', () => {
  it('exposes shared utilities', () => {
    expect(shared.noop).toBeTypeOf('function')
    expect(shared.isClient).toBeTypeOf('boolean')
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
