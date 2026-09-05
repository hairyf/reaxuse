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

export * from './useArrayEvery'
// export * from './useArrayFilter'
export * from './useArrayFind'
export * from './useArrayJoin'
// export * from './useArrayFindIndex'
// export * from './useArrayFindLast'
// export * from './useArrayIncludes'
// export * from './useArrayJoin'
export * from './useArrayMap'
// export * from './useArrayMap'
// export * from './useArrayReduce'
export * from './useArraySome'
// export * from './useArrayUnique'
export * from './useCounter'
// export * from './useDateFormat'
// export * from './useDebounceFn'
// export * from './useInterval'
// export * from './useIntervalFn'
// export * from './useLastChanged'
export * from './useMount'
// export * from './useThrottleFn'
export * from './useTimeout'
export * from './useTimeoutFn'
export * from './useToggle'
export * from './useToNumber'
export * from './useToString'
export * from './useUnmount'
export * from './useUpdate'
export * from './useWatch'
// export * from './useWatchArray'
// export * from './useWatchAtMost'
// export * from './useWatchDebounced'
// export * from './useWatchDeep'
// export * from './useWatchIgnorable'
// export * from './useWatchImmediate'
// export * from './useWatchOnce'
// export * from './useWatchPausable'
// export * from './useWatchThrottled'
// export * from './useWatchTriggerable'
// export * from './useWatchWithFilter'
export * from './useWhenever'
