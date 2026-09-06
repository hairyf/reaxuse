import { useTemporalNow } from '@reaxuse/core'
import { useState } from 'react'

const timezones = [
  { label: 'UTC', value: 'UTC' },
  { label: 'New York', value: 'America/New_York' },
  { label: 'London', value: 'Europe/London' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
  { label: 'Sydney', value: 'Australia/Sydney' },
]

const calendars = [
  { label: 'Gregorian', value: 'gregory' },
  { label: 'Islamic', value: 'islamic-umalqura' },
  { label: 'Hebrew', value: 'hebrew' },
  { label: 'Chinese', value: 'chinese' },
  { label: 'Japanese', value: 'japanese' },
]

const panel = {
  padding: '12px',
  borderRadius: '8px',
  background: 'rgba(128, 128, 128, 0.1)',
} as const

const control = {
  width: '100%',
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid rgba(128, 128, 128, 0.4)',
  background: 'transparent',
  color: 'inherit',
} as const

const button = {
  padding: '6px 14px',
  borderRadius: '6px',
  border: '1px solid rgba(128, 128, 128, 0.4)',
  cursor: 'pointer',
} as const

export default function UseTemporalNowDemo() {
  const {
    timezone,
    calendar,
    toTimezone,
    toPlainDate,
    toPlainTime,
    toPlainDateTime,
    format,
    add,
    subtract,
    pause,
    resume,
    isActive,
    setTimezone,
    setCalendar,
  } = useTemporalNow()

  const [selectedTimezone, setSelectedTimezone] = useState('UTC')
  const [selectedCalendar, setSelectedCalendar] = useState('gregory')
  const [durationInput, setDurationInput] = useState('P1D')

  function updateTimezone() {
    setTimezone(selectedTimezone)
  }

  function updateCalendar() {
    setCalendar(selectedCalendar)
  }

  function addDuration() {
    try {
      // eslint-disable-next-line no-console
      console.log('Added duration:', add(durationInput).toString())
    }
    catch {
      console.error('Invalid duration format')
    }
  }

  function subtractDuration() {
    try {
      // eslint-disable-next-line no-console
      console.log('Subtracted duration:', subtract(durationInput).toString())
    }
    catch {
      console.error('Invalid duration format')
    }
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Current Time Display */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
          {format()}
        </div>
        <div style={{ fontSize: '0.85rem', opacity: 0.6, display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <span>{timezone}</span>
          <span>{calendar}</span>
          <span>{isActive ? 'Active' : 'Paused'}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button type="button" style={button} onClick={() => (isActive ? pause() : resume())}>
          {isActive ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Timezone Selection */}
      <div>
        <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '6px' }}>Timezone</div>
        <select
          style={control}
          value={selectedTimezone}
          onChange={(event) => {
            setSelectedTimezone(event.target.value)
            updateTimezone()
          }}
        >
          {timezones.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      {/* Calendar Selection */}
      <div>
        <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '6px' }}>Calendar System</div>
        <select
          style={control}
          value={selectedCalendar}
          onChange={(event) => {
            setSelectedCalendar(event.target.value)
            updateCalendar()
          }}
        >
          {calendars.map(cal => (
            <option key={cal.value} value={cal.value}>{cal.label}</option>
          ))}
        </select>
      </div>

      {/* World Clock */}
      <div>
        <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '6px' }}>World Clock</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {timezones.slice(1, 5).map(tz => (
            <div key={tz.value} style={{ ...panel, textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{tz.label}</div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                {toTimezone(tz.value).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Duration Operations */}
      <div>
        <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '6px' }}>Duration Operations</div>
        <input
          style={{ ...control, marginBottom: '8px' }}
          value={durationInput}
          placeholder="P1D, PT2H, P1M"
          onChange={event => setDurationInput(event.target.value)}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" style={button} onClick={addDuration}>Add</button>
          <button type="button" style={button} onClick={subtractDuration}>Subtract</button>
        </div>
      </div>

      {/* Format Examples */}
      <div>
        <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '6px' }}>Format Examples</div>
        <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', display: 'grid', gap: '4px' }}>
          <div>{`Short: ${format({ dateStyle: 'short' })}`}</div>
          <div>{`Long: ${format({ dateStyle: 'long' })}`}</div>
          <div>{`Time: ${format({ timeStyle: 'medium' })}`}</div>
        </div>
      </div>

      {/* Components */}
      <div>
        <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '6px' }}>Components</div>
        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', opacity: 0.7, display: 'grid', gap: '4px' }}>
          <div>{`Date: ${toPlainDate().toString()}`}</div>
          <div>{`Time: ${toPlainTime().toString()}`}</div>
          <div>{`DateTime: ${toPlainDateTime().toString()}`}</div>
        </div>
      </div>
    </div>
  )
}
