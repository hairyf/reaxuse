// Relative (not `@reaxuse/integrations`): until this PR is merged the package
// name resolves through the worktree node_modules junction to the main repo's
// still-empty integrations package, which has no `useNProgress` export.
import { useNProgress } from '../src/useNProgress'

export default function UseNProgressDemo() {
  const { isLoading, progress, setIsLoading } = useNProgress()

  return (
    <div>
      <div>
        Click to change progress status
      </div>
      <button onClick={() => setIsLoading(!isLoading)}>
        {isLoading ? 'Stop' : 'Start'}
      </button>
      {isLoading && (
        <b>
          {`${((progress || 0) * 100).toFixed(0)}%`}
        </b>
      )}
    </div>
  )
}
