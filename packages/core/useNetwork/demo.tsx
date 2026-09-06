import { useNetwork } from '@reaxuse/core'

export default function UseNetworkDemo() {
  const network = useNetwork()

  return (
    <div>
      <p>Disconnect your network or change connection type to see changes</p>
      <pre>
        {JSON.stringify(network, null, 2)}
      </pre>
    </div>
  )
}
