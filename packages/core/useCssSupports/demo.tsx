import { useCssSupports } from '@reaxuse/core'
import { useState } from 'react'

export default function UseCssSupportsDemo() {
  // React state is the idiomatic equivalent of the upstream `shallowRef`s
  const [conditionText, setConditionText] = useState('display: flex')
  const [prop, setProp] = useState('container-type')
  const [value, setValue] = useState('scroll-state')

  const { isSupported: conditionTextSupported } = useCssSupports(conditionText)
  const { isSupported: propValueSupported } = useCssSupports(prop, value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <input
        name="condition"
        type="text"
        value={conditionText}
        onChange={e => setConditionText(e.target.value)}
      />
      <span>
        <code>
          useCssSupports(&quot;
          {conditionText}
          &quot;)
        </code>
        {': '}
        {String(conditionTextSupported)}
      </span>
      <hr />
      <input
        name="prop"
        type="text"
        value={prop}
        onChange={e => setProp(e.target.value)}
      />
      <input
        name="value"
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <span>
        <code>
          useCssSupports(&quot;
          {prop}
          &quot;,
          &quot;
          {value}
          &quot;)
        </code>
        {': '}
        {String(propValueSupported)}
      </span>
    </div>
  )
}
