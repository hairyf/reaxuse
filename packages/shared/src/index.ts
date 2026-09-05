/**
 * @reaxuse/shared — React port of @vueuse/shared
 * Shared utilities shared across all reaxuse packages.
 *
 * Mapping note: @vueuse/shared exposes pure utilities + composables that
 * don't depend on the renderer. In the React world those become either
 * plain functions (no hook) or hooks without rendering logic.
 */

export const isClient = typeof window !== 'undefined'

export function noop(): void {}

export type MaybeRef<T> = T | { current: T }

export * from './useCounter'
export * from './useMount'
export * from './useTimeout'
export * from './useToggle'
export * from './useToString'
export * from './useUnmount'
export * from './useUpdate'
export * from './useWatch'
export * from './useWhenever'
