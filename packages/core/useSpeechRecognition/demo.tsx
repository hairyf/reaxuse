import { useSpeechRecognition } from '@reaxuse/core'
import { useEffect, useState } from 'react'

// Ported from source/vueuse/packages/core/useSpeechRecognition/demo.vue —
// the JSGF SpeechGrammarList part is omitted; language selection, start/stop,
// transcript display and the color highlight are kept.

const COLORS = ['aqua', 'azure', 'beige', 'bisque', 'black', 'blue', 'brown', 'chocolate', 'coral', 'crimson', 'cyan', 'fuchsia', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'indigo', 'ivory', 'khaki', 'lavender', 'lime', 'linen', 'magenta', 'maroon', 'moccasin', 'navy', 'olive', 'orange', 'orchid', 'peru', 'pink', 'plum', 'purple', 'red', 'salmon', 'sienna', 'silver', 'snow', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'white', 'yellow', 'transparent']

const LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
]

function sample<T>(arr: T[], size: number) {
  const shuffled = arr.slice(0)
  let i = arr.length
  let temp: T
  let index: number
  while (i--) {
    index = Math.floor((i + 1) * Math.random())
    temp = shuffled[index]!
    shuffled[index] = shuffled[i]!
    shuffled[i] = temp
  }
  return shuffled.slice(0, size)
}

export default function UseSpeechRecognitionDemo() {
  const [lang, setLang] = useState('en-US')
  const { isSupported, isListening, result, start, stop } = useSpeechRecognition({ lang, continuous: true })

  const [color, setColor] = useState('transparent')
  const [sampled, setSampled] = useState<string[]>([])
  // the recognition instance only picks up a new language while it is not
  // listening, so the shown language lags behind `lang` the same way as the
  // upstream demo's `selectedLanguage`
  const [selectedLanguage, setSelectedLanguage] = useState(lang)

  useEffect(() => {
    for (const word of result.toLowerCase().split(' ').reverse()) {
      if (COLORS.includes(word)) {
        setColor(word)
        break
      }
    }
  }, [result])

  useEffect(() => {
    if (!isListening)
      setSelectedLanguage(lang)
  }, [lang, isListening])

  if (!isSupported) {
    return (
      <div>
        Your browser does not support SpeechRecognition API,
        {' '}
        <a href="https://caniuse.com/mdn-api_speechrecognition" target="_blank" rel="noreferrer">more details</a>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 16 }}>
        {LANGUAGES.map(language => (
          <label key={language.value}>
            <input
              type="radio"
              checked={lang === language.value}
              onChange={() => setLang(language.value)}
            />
            {' '}
            <span>{language.label}</span>
          </label>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        {isListening
          ? <button type="button" style={{ color: 'orange' }} onClick={stop}>Stop</button>
          : (
              <button
                type="button"
                onClick={() => {
                  setColor('transparent')
                  setSampled(sample(COLORS, 5))
                  start()
                }}
              >
                Press and talk
              </button>
            )}
      </div>
      {isListening && (
        <div style={{ marginTop: 16 }}>
          {selectedLanguage === 'en-US' && (
            <>
              <p style={{ marginBottom: 8 }}><b>Please say a color</b></p>
              <p style={{ marginBottom: 8 }}>{`try: ${sampled.join(', ')}`}</p>
            </>
          )}
          {selectedLanguage === 'es' && <p>Speak some Spanish!</p>}
          {selectedLanguage === 'fr' && <p>Speak some French!</p>}
          <p
            style={{
              padding: '4px 12px',
              borderRadius: 4,
              background: selectedLanguage === 'en-US' ? color : 'transparent',
            }}
          >
            {result}
          </p>
        </div>
      )}
    </div>
  )
}
