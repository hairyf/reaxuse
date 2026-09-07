import { useCycleList } from '@reaxuse/core'

// ref-like `{ current }` list — mirrors upstream's `shallowRef` demo
const list = { current: ['Dog', 'Cat', 'Lizard', 'Shark', 'Whale', 'Dolphin', 'Octopus', 'Seal'] }

export default function UseCycleListDemo() {
  const { state, next, prev } = useCycleList(list)

  return (
    <div>
      <div className="text-primary text-lg font-bold">
        {state}
      </div>
      <button type="button" onClick={() => prev()}>
        Prev
      </button>
      <button type="button" onClick={() => next()}>
        Next
      </button>
    </div>
  )
}
