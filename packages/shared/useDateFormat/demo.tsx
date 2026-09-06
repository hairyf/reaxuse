import { useDateFormat } from '@reaxuse/shared'
import { useEffect, useState } from 'react'

const languages = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
]

export default function UseDateFormatDemo() {
  const [date, setDate] = useState(() => new Date())
  const [formatter, setFormatter] = useState('dddd YYYY-MM-DD HH:mm:ss')
  const [lang, setLang] = useState('en-US')

  // tick the date every second — the React counterpart of upstream's useNow()
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatted = useDateFormat(date, formatter, { locales: lang })

  return (
    <div>
      <p className="text-20px font-bold text-emerald-500">{formatted}</p>
      <div className="flex flex-col">
        <span className="mr-5px text-18px">
          Formatter Editor :
        </span>
        <input value={formatter} type="text" onChange={event => setFormatter(event.target.value)} />
        <div className="flex items-center gap-x-4 flex-wrap">
          {languages.map(({ label, value }) => (
            <label key={value} className="radio">
              <input
                type="radio"
                name="lang"
                value={value}
                checked={lang === value}
                onChange={event => setLang(event.target.value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
