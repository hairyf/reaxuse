import { useAnimate } from '@reaxuse/core'
import { useRef } from 'react'

export default function UseAnimateDemo() {
  const el = useRef<HTMLParagraphElement>(null)

  const {
    play,
    pause,
    reverse,
    finish,
    cancel,
    startTime,
    currentTime,
    playbackRate,
    playState,
    replaceState,
    pending,
  } = useAnimate(
    el,
    [
      { clipPath: 'circle(20% at 0% 30%)' },
      { clipPath: 'circle(20% at 50% 80%)' },
      { clipPath: 'circle(20% at 100% 30%)' },
    ],
    {
      duration: 3000,
      iterations: 5,
      direction: 'alternate',
      easing: 'cubic-bezier(0.46, 0.03, 0.52, 0.96)',
    },
  )

  const text = JSON.stringify({
    startTime,
    currentTime,
    playbackRate,
    playState,
    replaceState,
    pending,
  }, null, 2)

  return (
    <div>
      <div className="flex items-center justify-center w-full h-60">
        <p ref={el} className="text-5xl font-800">
          reaxuse useAnimate
        </p>
      </div>
      <div>
        {playState === 'running'
          ? <button onClick={pause}>pause</button>
          : <button onClick={play}>play</button>}
        <button onClick={reverse}>reverse</button>
        <button onClick={finish}>finish</button>
        <button onClick={cancel}>cancel</button>
      </div>
      <pre className="code-block">
        {text}
      </pre>
    </div>
  )
}
