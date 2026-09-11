import { useWebMCP } from '@reause/core'
import { useState } from 'react'

export default function UseWebMCPDemo() {
  const [todos, setTodos] = useState<string[]>([])
  const [draft, setDraft] = useState('')

  const { isSupported, isRegistered, error } = useWebMCP({
    name: 'add-todo',
    description: 'Add a new item to the user\'s active todo list',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The text content of the todo item' },
      },
      required: ['text'],
    },
    async execute({ text }: { text: string }) {
      setTodos(prev => [...prev, text])
      return `Added todo item: "${text}" successfully.`
    },
  })

  function add() {
    const text = draft.trim()
    if (!text)
      return
    setTodos(prev => [...prev, text])
    setDraft('')
  }

  return (
    <div>
      <p>
        Supported:
        {' '}
        <strong>{String(isSupported)}</strong>
      </p>
      <p>
        Tool registered:
        {' '}
        <strong>{String(isRegistered)}</strong>
      </p>
      {error && (
        <p>
          Error:
          {' '}
          <strong>{error.message}</strong>
        </p>
      )}

      <p>
        When a WebMCP-capable agent is present, it can call the
        {' '}
        <code>add-todo</code>
        {' '}
        tool to append items below — the same list you edit by hand. The tool is unregistered
        automatically when this demo unmounts.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          add()
        }}
      >
        <input
          type="text"
          value={draft}
          placeholder="Add a todo…"
          onChange={event => setDraft(event.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map(todo => (
          <li key={todo}>{todo}</li>
        ))}
      </ul>
    </div>
  )
}
