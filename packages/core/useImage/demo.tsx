import { useImage } from '@reaxuse/core'
import { useState } from 'react'

const colors = ['fff', '000', '5f0caa']

export default function UseImageDemo() {
  const [imageOptions, setImageOptions] = useState({ src: 'https://place-hold.it/300x200' })
  const { isLoading, error } = useImage(imageOptions, { delay: 1000 })

  function change() {
    const color = colors[Math.floor(Math.random() * colors.length)]
    setImageOptions({ src: `https://place-hold.it/300x200/${color}` })
  }

  function createError() {
    setImageOptions({ src: '' })
  }

  return (
    <div>
      {isLoading && (
        <div className="w-[300px] h-[200px] animate-pulse bg-gray-500/5 p-2">
          Loading...
        </div>
      )}
      {!isLoading && !!error && (
        <div className="text-red">
          Failed
        </div>
      )}
      {!isLoading && !error && (
        <img src={imageOptions.src} alt="placeholder" className="w-[300px] h-[200px]" />
      )}

      <button type="button" onClick={change}>
        Change
      </button>

      <button type="button" style={{ marginLeft: '8px' }} onClick={createError}>
        Create Error
      </button>
    </div>
  )
}
