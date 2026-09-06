import { useOnline } from '@reaxuse/core'

export default function UseOnlineDemo() {
  const online = useOnline()

  return (
    <div>
      <p>Disconnect your network to see changes</p>
      <div>
        {'Status: '}
        <strong>{online ? 'Online' : 'Offline'}</strong>
      </div>
    </div>
  )
}
