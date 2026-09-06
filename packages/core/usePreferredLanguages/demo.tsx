import { usePreferredLanguages } from '@reaxuse/core'

export default function UsePreferredLanguagesDemo() {
  const languages = usePreferredLanguages()

  return (
    <div>
      <p>
        Preferred Languages:
      </p>
      <div>
        {languages.map(lang => (
          <code key={lang}>{lang}</code>
        ))}
      </div>
    </div>
  )
}
