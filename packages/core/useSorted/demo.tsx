import { useSorted } from '@reaxuse/core'
import { useState } from 'react'

const objArr = [
  { name: 'John', age: 40 },
  { name: 'Jane', age: 20 },
  { name: 'Joe', age: 30 },
  { name: 'Jenny', age: 22 },
]

function formatUsers(users: Array<{ name: string, age: number }>) {
  return users.map(user => `${user.name}(${user.age})`).join(', ')
}

export default function UseSortedDemo() {
  const [text, setText] = useState('10, 3, 5, 7, 2, 1, 8, 6, 9, 4')

  // upstream's demo feeds raw strings; parse numbers here so the default
  // numeric comparator applies
  const inputArr = text
    .split(',')
    .map(part => Number.parseFloat(part.trim()))
    .filter(value => !Number.isNaN(value))
  const sorted = useSorted(inputArr)
  const objSorted = useSorted(objArr, (a, b) => a.age - b.age)

  function randomArr() {
    const arr: number[] = []
    const count = 10 + Math.floor(Math.random() * 11)
    for (let i = 0; i < count; i++)
      arr.push(Math.floor(Math.random() * 101))
    setText(arr.join(','))
  }

  return (
    <div>
      <div>
        input:
        {' '}
        <input
          type="text"
          value={text}
          onChange={event => setText(event.target.value)}
        />
        <button type="button" onClick={randomArr}>random</button>
      </div>
      <div>
        output:
        {' '}
        {sorted.join(', ')}
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <div>object property sort:</div>
        <div>
          input:
          {' '}
          {formatUsers(objArr)}
        </div>
        <div>
          output:
          {' '}
          {formatUsers(objSorted)}
        </div>
      </div>
    </div>
  )
}
