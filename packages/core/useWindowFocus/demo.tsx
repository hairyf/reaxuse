import { useWindowFocus } from '@reaxuse/core'

export default function UseWindowFocusDemo() {
  const startMessage = '💡 Click somewhere outside of the document to unfocus.'
  const focused = useWindowFocus()

  return (
    <div>
      <p>{focused ? startMessage : 'ℹ Tab is unfocused'}</p>
    </div>
  )
}
