// Relative (not `@reause/integrations`): until this PR is merged the package
// name resolves through the worktree node_modules junction to the main repo's
// still-empty integrations package.
import { useState } from 'react'
import { useJwt } from '../useJwt'

const defaultJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.L8i6g3PfcHlioHCCPURC9pmXT7gdJpx3kOoyAfNUwCc'
const customJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImZvbyI6ImJhciJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJmb28iOiJiYXIifQ.S5QwvREUfgEdpB1ljG_xN6NI3HubQ79xx6J1J4dsJmg'

export default function UseJwtDemo() {
  const [encodedJwt, setEncodedJwt] = useState(defaultJwt)
  // the decoded values are plain values, not refs
  const { header, payload } = useJwt(encodedJwt, {
    onError: error => console.error(error),
  })

  return (
    <div>
      <button
        onClick={() => setEncodedJwt(encodedJwt === defaultJwt ? customJwt : defaultJwt)}
      >
        Toggle token
      </button>
      <p>Header</p>
      <pre lang="json" className="ml-2">{JSON.stringify(header, null, 2)}</pre>
      <p>Payload</p>
      <pre lang="json" className="ml-2">{JSON.stringify(payload, null, 2)}</pre>
    </div>
  )
}
