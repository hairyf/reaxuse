import { useEyeDropper } from '@reaxuse/core'

export default function UseEyeDropperDemo() {
  const { isSupported, open, sRGBHex } = useEyeDropper()

  return (
    <div>
      {isSupported
        ? (
            <div>
              <div>
                isSupported:
                {isSupported}
              </div>
              <div>
                sRGBHex:
                {' '}
                <span style={{ color: sRGBHex }}>{sRGBHex}</span>
              </div>
              <button onClick={() => open()}>
                Open Eye Dropper
              </button>
            </div>
          )
        : (
            <span>Not Supported by Your Browser</span>
          )}
    </div>
  )
}
