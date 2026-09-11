import { useQRCode } from '@reause/integrations'
import { useMemo, useState } from 'react'

export default function UseQRCodeDemo() {
  const [text, setText] = useState('https://vueuse.org')
  // memoized — a fresh options literal each render would re-encode every render
  const options = useMemo(() => ({ errorCorrectionLevel: 'H' as const, margin: 3 }), [])
  const qrcode = useQRCode(text, options)

  return (
    <div>
      <div>
        Text content for QRCode
      </div>
      <input
        type="text"
        value={text}
        onChange={event => setText(event.target.value)}
      >
      </input>
      {text && qrcode
        ? <img className="mt-6 mb-2 rounded border" src={qrcode} alt="QR Code"></img>
        : null}
    </div>
  )
}
