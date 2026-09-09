import { useCountdown } from '@reaxuse/core'
import { useRef, useState } from 'react'

const rocketStyles = `
.rocket {
  transform: rotate(-45deg);
  font-size: 40px;
}
.rocket.launching {
  animation: rocket 4s ease-in-out forwards;
}
@keyframes rocket {
  0% {
    transform: translateY(0) rotate(-45deg);
  }
  50% {
    transform: translateY(-200px) rotate(-45deg);
  }
  100% {
    transform: translateY(0) rotate(-45deg);
  }
}
`

export default function UseCountdownDemo() {
  const rocketRef = useRef<HTMLDivElement>(null)
  const [countdownSeconds, setCountdownSeconds] = useState(5)
  const [remaining, , { start, stop, pause, resume }] = useCountdown(countdownSeconds, {
    onComplete() {
      rocketRef.current?.classList.add('launching')
    },
    onTick() {

    },
  })

  function startCountdown() {
    rocketRef.current?.classList.remove('launching')
    start(countdownSeconds)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <style>{rocketStyles}</style>
      <div
        ref={rocketRef}
        className="rocket"
        onAnimationEnd={() => rocketRef.current?.classList.remove('launching')}
      >
        🚀
      </div>
      <div>
        Rocket launch in
        {' '}
        <strong>{remaining}</strong>
        {' '}
        seconds
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        Countdown:
        <input
          type="number"
          style={{ width: 40 }}
          value={countdownSeconds}
          onChange={event => setCountdownSeconds(Number(event.target.value))}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
        <button type="button" onClick={startCountdown}>
          Start
        </button>
        <button type="button" onClick={stop}>
          Stop
        </button>
        <button type="button" onClick={pause}>
          Pause
        </button>
        <button type="button" onClick={resume}>
          Resume
        </button>
      </div>
    </div>
  )
}
