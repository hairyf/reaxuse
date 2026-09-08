import { useClickOutside } from '@reaxuse/core'
import { useRef, useState } from 'react'

export default function UseClickOutsideDemo() {
  const [modal, setModal] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useClickOutside(modalRef, () => {
    setModal(false)
  })

  const [dropdown, setDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(
    dropdownRef,
    () => {
      setDropdown(false)
    },
  )

  return (
    <div className="us-click-outside">
      <button onClick={() => setModal(true)}>
        Open Modal
      </button>
      <div className="ml-2 relative inline-block">
        <button onClick={() => setDropdown(d => !d)}>
          Toggle Dropdown
        </button>
        {dropdown && (
          <div ref={dropdownRef} className="dropdown-inner">
            Click outside of the dropdown to close it.
          </div>
        )}
      </div>
      {modal && (
        <div ref={modalRef} className="modal">
          <div className="inner">
            <button className="button small" title="Close" onClick={() => setModal(false)}>
              𝖷
            </button>
            <p className="heading">
              Demo Modal
            </p>
            <p>Click outside of the modal to close it.</p>
          </div>
        </div>
      )}
      <style>
        {`
        .us-click-outside .relative {
          position: relative;
        }
        .us-click-outside .inline-block {
          display: inline-block;
        }
        .us-click-outside .ml-2 {
          margin-left: 0.5rem;
        }
        .us-click-outside .modal {
          position: fixed;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 420px;
          max-width: 100%;
          z-index: 10;
        }
        .us-click-outside .inner {
          background-color: var(--vp-c-bg);
          padding: 0.4em 2em;
          border-radius: 5px;
          border: 1px solid var(--vp-c-divider);
          box-shadow: 2px 2px 10px rgba(10, 10, 10, 0.1);
        }
        .us-click-outside .dropdown-inner {
          background-color: var(--vp-c-bg);
          padding: 0.5em;
          position: absolute;
          left: 0;
          z-index: 10;
          border-radius: 5px;
          border: 1px solid var(--vp-c-divider);
          box-shadow: 2px 2px 5px rgba(10, 10, 10, 0.1);
        }
        .us-click-outside .heading {
          font-weight: bold;
          font-size: 1.4rem;
          margin-bottom: 2rem;
        }
        .us-click-outside .button {
          position: absolute;
          top: -0.9rem;
          right: -0.5rem;
          font-weight: bold;
        }
      `}
      </style>
    </div>
  )
}
