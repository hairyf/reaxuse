import type { CSSProperties } from 'react'
import { useFocus } from '@reaxuse/core'
import { useRef } from 'react'

const elementStyle: CSSProperties = {
  padding: '6px 12px',
  borderRadius: 4,
  border: '1px solid var(--vp-c-divider)',
  margin: '4px 0',
}

function focusOutline(focused: boolean): CSSProperties {
  return { outline: focused ? '2px solid var(--vp-c-brand)' : 'none' }
}

export default function UseFocusDemo() {
  const text = useRef<HTMLParagraphElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  const [paragraphFocused, setParagraphFocus] = useFocus(text)
  const [inputFocused, setInputFocus] = useFocus(input, { initialValue: true })
  const [buttonFocused, setButtonFocus] = useFocus(button)

  return (
    <div>
      <p
        ref={text}
        tabIndex={0}
        style={{ ...elementStyle, ...focusOutline(paragraphFocused) }}
      >
        Paragraph that can be focused
      </p>
      <input
        ref={input}
        type="text"
        placeholder="Input that can be focused"
        style={{ ...elementStyle, ...focusOutline(inputFocused) }}
      />
      <button
        ref={button}
        type="button"
        style={{ ...elementStyle, ...focusOutline(buttonFocused) }}
      >
        Button that can be focused
      </button>
      <hr />
      <p>
        {paragraphFocused
          ? 'The paragraph has focus'
          : inputFocused
            ? 'The input control has focus'
            : buttonFocused
              ? 'The button has focus'
              : '\u00A0'}
      </p>
      <button type="button" onClick={() => { setParagraphFocus(prev => !prev) }}>
        Focus text
      </button>
      <button type="button" onClick={() => { setInputFocus(prev => !prev) }}>
        Focus input
      </button>
      <button type="button" onClick={() => { setButtonFocus(prev => !prev) }}>
        Focus button
      </button>
    </div>
  )
}
