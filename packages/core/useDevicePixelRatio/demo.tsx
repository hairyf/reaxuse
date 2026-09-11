import { useDevicePixelRatio } from '@reause/core'

export default function UseDevicePixelRatioDemo() {
  const { pixelRatio } = useDevicePixelRatio()

  return (
    <div>
      <p>
        Device Pixel Ratio:
        {' '}
        {pixelRatio}
      </p>
      <span className="opacity-50">Zoom in and out (or move the window to a screen with a different scaling factor) to see the value changes</span>
    </div>
  )
}
