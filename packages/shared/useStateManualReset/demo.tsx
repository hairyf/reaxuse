import { useStateManualReset } from '@reaxuse/shared'

export default function UseStateManualResetDemo() {
  const [message, setMessage, resetMessage] = useStateManualReset('Default message')

  return (
    <div>
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        type="text"
      />
      <button onClick={() => setMessage('Changed')}>
        Change Message
      </button>
      <button onClick={() => resetMessage()}>
        Reset Message
      </button>
    </div>
  )
}
