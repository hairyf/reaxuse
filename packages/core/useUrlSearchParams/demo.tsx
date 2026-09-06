import { useUrlSearchParams } from '@reaxuse/core'
import { useEffect } from 'react'

export default function UseUrlSearchParamsDemo() {
  const [params, setParams] = useUrlSearchParams('history')

  useEffect(() => {
    // upstream demo.vue mutates these during setup
    setParams(prev => ({ ...prev, foo: 'bar', vueuse: 'awesome' }))
  }, [setParams])

  function handleAddParams() {
    setParams(prev => ({ ...prev, biz: 'biz' }))
  }

  function handleChange(key: string, value: string) {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div>
      <ul className="!m-0">
        {Object.keys(params).map((key) => {
          const value = params[key]
          return (
            <li key={key}>
              {`${key}=`}
              {String(value)}
              <input
                value={Array.isArray(value) ? value.join(',') : value}
                onChange={event => handleChange(key, event.target.value)}
                placeholder={key}
                type="text"
              />
            </li>
          )
        })}
      </ul>

      {!params.biz && <button onClick={handleAddParams} type="button">Add Param</button>}
    </div>
  )
}
