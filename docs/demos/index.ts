import { lazy } from 'react'

/**
 * Registry of React demo components mountable from markdown via
 * `<DemoContainer name="…" />`. Static lazy imports keep the VitePress
 * build analyzable.
 */
export const demos = {
  UseToggle: lazy(() => import('./useToggleDemo')),
  UseCounter: lazy(() => import('./useCounterDemo')),
  UseNow: lazy(() => import('./useNowDemo')),
} as const
