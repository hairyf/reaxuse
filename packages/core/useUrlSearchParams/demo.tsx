import { useUrlSearchParams } from '@reaxuse/core'
import { useEffect } from 'react'

export default function UseUrlSearchParamsDemo() {
  const params = useUrlSearchParams('history')

  useEffect(() => {
    // upstream demo.vue mutates these during setup
    params.foo = 'bar'
    params.vueuse = 'awesome'
  }, [params])

  function handleAddParams() {
    params.biz = 'biz'
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
                onChange={(event) => {
                  params[key] = event.target.value
                }}
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
