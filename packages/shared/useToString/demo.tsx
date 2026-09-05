import { useToString } from '@reaxuse/shared'

const numberValue = useToString(123.345)
const stringValue = useToString('hi')
const objectValue = useToString({ foo: 'hi' })

export default function UseToStringDemo() {
  return (
    <div>
      <p>
        number:
        {' '}
        <strong>{numberValue}</strong>
      </p>
      <p>
        string:
        {' '}
        <strong>{stringValue}</strong>
      </p>
      <p>
        object:
        {' '}
        <strong>{objectValue}</strong>
      </p>
    </div>
  )
}
