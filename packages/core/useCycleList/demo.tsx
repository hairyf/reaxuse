import { useCycleList } from '@reaxuse/core'

// a plain read-only list (upstream's demo passes a `shallowRef`; resolve a
// React ref at the call site instead)
const list = ['Dog', 'Cat', 'Lizard', 'Shark', 'Whale', 'Dolphin', 'Octopus', 'Seal']

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
