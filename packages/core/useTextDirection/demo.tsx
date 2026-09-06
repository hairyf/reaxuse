import { useTextDirection } from '@reaxuse/core'

export default function UseTextDirectionDemo() {
  const [dir, setDir] = useTextDirection({
    selector: '#_useTextDirectionDemo',
  })
  const text = dir === 'ltr'
    ? 'This paragraph is in English and correctly goes left to right.'
    : 'This paragraph is in English but incorrectly goes right to left.'

  function handleOnClick() {
    setDir(dir === 'rtl' ? 'ltr' : 'rtl')
  }

  return (
    <div id="_useTextDirectionDemo">
      <p>{text}</p>
      <hr />
      <button onClick={handleOnClick}>
        <span className="ml-2">{dir.toUpperCase()}</span>
      </button>
      <span className="p-4 opacity-50">Click to change the direction</span>
      <style>{`#_useTextDirectionDemo[dir='rtl'] p { color: red; }`}</style>
    </div>
  )
}
