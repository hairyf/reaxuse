import { useLiveAnnouncer } from '@reaxuse/core'
import { useState } from 'react'

export default function UseLiveAnnouncerDemo() {
  const { announce, polite, assertive } = useLiveAnnouncer()
  const [last, setLast] = useState<string | null>(null)

  function handleAnnounce() {
    announce('Announcement using the base announce function.')
    setLast('announce')
  }

  function handlePolite() {
    polite('Polite announcement: The operation was successful.')
    setLast('polite')
  }

  function handleAssertive() {
    assertive('Assertive announcement: An error occurred!')
    setLast('assertive')
  }

  return (
    <div>
      <p>
        Click the buttons below to trigger screen reader announcements.
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={handleAnnounce}>
          Use Announce
        </button>
        <button type="button" onClick={handlePolite}>
          Announce Polite
        </button>
        <button type="button" onClick={handleAssertive}>
          Announce Assertive
        </button>
      </div>
      {last
        ? (
            <p>
              Last triggered:
              {' '}
              <code>{last}</code>
            </p>
          )
        : null}
      <p className="text-sm opacity-50">
        Note: You need a screen reader active to hear the announcements.
      </p>
    </div>
  )
}
