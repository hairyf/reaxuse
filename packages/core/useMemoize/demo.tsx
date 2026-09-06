import { useMemoize } from '@reaxuse/core'
import { useState } from 'react'

interface User {
  id: number
  name: string
  fetchedAt: string
}

// simulate a slow API request so cache hits are visually distinct
async function fetchUser(id: number): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 400))
  return {
    id,
    name: `User ${id}`,
    fetchedAt: new Date().toLocaleTimeString(),
  }
}

export default function UseMemoizeDemo() {
  const [userId, setUserId] = useState(1)
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState('idle')
  const [log, setLog] = useState<string[]>([])
  const getUser = useMemoize(fetchUser)

  function record(message: string) {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()} ${message}`])
  }

  async function load() {
    const cached = getUser.cache.has(getUser.generateKey(userId))
    setStatus('loading…')
    const result = await getUser(userId)
    setUser(result)
    setStatus(cached ? 'resolved from cache' : 'resolved (first fetch)')
    record(`get(${userId}) → ${cached ? 'cache hit' : 'cache miss'}`)
  }

  async function forceLoad() {
    setStatus('loading…')
    const result = await getUser.load(userId)
    setUser(result)
    setStatus('resolved (forced re-fetch)')
    record(`load(${userId}) → forced re-fetch`)
  }

  function clearCache() {
    getUser.clear()
    setUser(null)
    setStatus('cache cleared')
    record('clear() → cache emptied')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <label>
          {'User ID: '}
          <input
            type="number"
            min={1}
            value={userId}
            onChange={event => setUserId(Number(event.target.value))}
          />
        </label>
        <button onClick={load}>Get user</button>
        <button onClick={forceLoad}>Force re-fetch</button>
        <button onClick={clearCache}>Clear cache</button>
      </div>

      <p>
        {'Status: '}
        <strong>{status}</strong>
      </p>

      {user && (
        <div style={{ border: '1px solid #8884', borderRadius: '4px', padding: '8px', marginBottom: '12px' }}>
          <strong>User</strong>
          <pre style={{ margin: '4px 0 0' }}>{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}

      <div style={{ border: '1px solid #8884', borderRadius: '4px', padding: '8px' }}>
        <strong>Cache log</strong>
        <pre style={{ margin: '4px 0 0' }}>{log.length ? log.join('\n') : 'no calls yet'}</pre>
      </div>
    </div>
  )
}
