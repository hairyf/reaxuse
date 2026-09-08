import { useStateAutoReset } from '@reaxuse/shared'

export default function UseStateAutoResetDemo() {
  const [message, setMessage] = useStateAutoReset('Default message', 1000)

  function changeMessage() {
    setMessage('Changed')
  }

  return (
    <div>
      <button onClick={changeMessage}>
        Change Message
      </button>
      <p>
        {message}
      </p>
    </div>
  )
}
