import { useColorMode } from '@reause/core'

type ColorMode = 'dark' | 'light' | 'cafe' | 'contrast' | 'auto'

const MODES: ColorMode[] = ['dark', 'light', 'cafe', 'contrast', 'auto']

export default function UseColorModeDemo() {
  const [mode, setMode] = useColorMode<ColorMode>({
    emitAuto: true,
    modes: {
      contrast: 'dark contrast',
      cafe: 'cafe',
    },
  })

  const next = () => {
    const index = MODES.indexOf(mode)
    setMode(MODES[(index + 1) % MODES.length])
  }

  return (
    <div>
      <style>
        {`html.cafe {
  filter: sepia(0.9) hue-rotate(315deg) brightness(0.9);
}

html.contrast {
  filter: contrast(2);
}`}
      </style>
      <button onClick={next}>
        <span className="capitalize">{mode}</span>
      </button>
      <span className="ml-2 opacity-50">
        ← Click to change the color mode
      </span>
    </div>
  )
}
