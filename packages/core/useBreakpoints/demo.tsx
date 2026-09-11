import { breakpointsTailwind, useBreakpoints } from '@reause/core'
import { useState } from 'react'

function BooleanDisplay({ value }: { value: boolean }) {
  return <code>{String(value)}</code>
}

export default function UseBreakpointsDemo() {
  const breakpoints = useBreakpoints(breakpointsTailwind)
  const smWidth = breakpointsTailwind.sm

  // upstream's `shallowRef<keyof typeof breakpointsTailwind>('sm')` — a React
  // state so changing the select re-resolves the getter-like method
  const [activeBreakpoint, setActiveBreakpoint] = useState<keyof typeof breakpointsTailwind>('sm')
  const isGreaterThanBreakpoint = breakpoints.greaterOrEqual(activeBreakpoint)

  const current = breakpoints.current()
  const active = breakpoints.active()
  const xs = breakpoints.smaller('sm')
  const xse = breakpoints.smallerOrEqual('sm')
  const sm = breakpoints.between('sm', 'md')
  const md = breakpoints.between('md', 'lg')
  const lg = breakpoints.between('lg', 'xl')
  const xl = breakpoints.between('xl', '2xl')
  const xxl = breakpoints['2xl']

  return (
    <div className="font-mono">
      <div>
        {' '}
        Current breakpoints:
        {' '}
        {current.length > 0 ? current.join(', ') : 'none'}
      </div>
      <div>
        {' '}
        Active breakpoint:
        {' '}
        {active || 'none'}
      </div>
      <div>
        {' '}
        {`xs(<${smWidth}px):`}
        {' '}
        <BooleanDisplay value={xs} />
      </div>
      <div>
        {' '}
        {`xs(<=${smWidth}px):`}
        {' '}
        <BooleanDisplay value={xse} />
      </div>
      <div>
        {' '}
        sm:
        {' '}
        <BooleanDisplay value={sm} />
      </div>
      <div>
        {' '}
        md:
        {' '}
        <BooleanDisplay value={md} />
      </div>
      <div>
        {' '}
        lg:
        {' '}
        <BooleanDisplay value={lg} />
      </div>
      <div>
        {' '}
        xl:
        {' '}
        <BooleanDisplay value={xl} />
      </div>
      <div>
        {' '}
        2xl:
        {' '}
        <BooleanDisplay value={xxl} />
      </div>
      <div>
        {' '}
        isGreaterThanBreakpoint:
        {' '}
        <select
          value={activeBreakpoint}
          onChange={e => setActiveBreakpoint(e.target.value as keyof typeof breakpointsTailwind)}
        >
          {(Object.keys(breakpointsTailwind) as (keyof typeof breakpointsTailwind)[]).map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        {' '}
        <BooleanDisplay value={isGreaterThanBreakpoint} />
      </div>
    </div>
  )
}
