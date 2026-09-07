import { useConfirmDialog } from '@reaxuse/core'
import { useListener } from '@reaxuse/shared'
import { useState } from 'react'

export default function UseConfirmDialogDemo() {
  const [message, setMessage] = useState('')
  const {
    isRevealed: isRevealed1,
    reveal: reveal1,
    confirm: confirm1,
    cancel: cancel1,
    onReveal: onReveal1,
    onConfirm: onConfirm1,
    onCancel: onCancel1,
  } = useConfirmDialog()
  const {
    isRevealed: isRevealed2,
    reveal: reveal2,
    confirm: confirm2,
    cancel: cancel2,
    onReveal: onReveal2,
    onConfirm: onConfirm2,
    onCancel: onCancel2,
  } = useConfirmDialog()

  useListener(onReveal1, () => {
    setMessage('Modal is shown!')
  })

  useListener(onConfirm1, () => {
    reveal2()
  })

  useListener(onCancel1, () => {
    setMessage('Canceled!')
  })

  useListener(onReveal2, () => {
    setMessage('Second modal is shown!')
  })

  useListener(onConfirm2, (result) => {
    setMessage(result ? 'Confirmed!' : 'Rejected!')
  })

  useListener(onCancel2, () => {
    reveal1()
    setMessage('Canceled!')
  })

  return (
    <div>
      <h2>
        <span className="text-orange-400">{message}</span>
      </h2>
      <button
        type="button"
        disabled={isRevealed1 || isRevealed2}
        onClick={() => reveal1()}
      >
        Click to Show Modal Dialog
      </button>

      {isRevealed1
        ? (
            <div>
              <p>Show Second Dialog?</p>
              <footer>
                <button type="button" onClick={() => confirm1()}>
                  OK
                </button>
                <button type="button" onClick={() => cancel1()}>
                  Cancel
                </button>
              </footer>
            </div>
          )
        : null}

      {isRevealed2
        ? (
            <div>
              <p>Confirm or Reject</p>
              <footer>
                <button type="button" onClick={() => confirm2(true)}>
                  Confirm
                </button>
                <button type="button" onClick={() => confirm2(false)}>
                  Reject
                </button>
                <button type="button" onClick={() => cancel2()}>
                  Cancel
                </button>
              </footer>
            </div>
          )
        : null}
    </div>
  )
}
