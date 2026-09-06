import { useNavigatorLanguage } from '@reaxuse/core'

export default function UseNavigatorLanguageDemo() {
  const { isSupported, language } = useNavigatorLanguage()

  return (
    <div>
      <p>
        {'Supported: '}
        <strong>{isSupported ? 'true' : 'false'}</strong>
      </p>
      <p>Navigator Language:</p>
      <div>
        {isSupported
          ? <code>{language}</code>
          : 'The Navigator.language API is not supported in your browser.'}
      </div>
    </div>
  )
}
