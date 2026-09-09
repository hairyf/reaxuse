// Relative (not `@reaxuse/integrations`): until this PR is merged the package
// name resolves through the worktree node_modules junction to the main repo's
// still-empty integrations package.
import { useCookies } from '../src/useCookies'

export default function UseCookiesDemo() {
  const cookies = useCookies(['locale'])

  return (
    <div>
      <p>
        <strong>Cookies Value</strong>
        :
        {' '}
        {cookies.get('locale') || 'unknown'}
      </p>
      <pre style={{ marginLeft: '0.5rem' }}>{JSON.stringify(cookies.getAll(), null, 2)}</pre>
      <br />
      <span>Change to</span>
      <button onClick={() => cookies.set('locale', 'ru-RU')}>
        Russian
      </button>
      <button onClick={() => cookies.set('locale', 'en-US')}>
        English
      </button>
    </div>
  )
}
