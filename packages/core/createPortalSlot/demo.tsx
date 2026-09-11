import { createPortalSlot } from '@reause/core'

const [PortalSlot, SlotTarget] = createPortalSlot<{ title: string }>()

export default function CreatePortalSlotDemo() {
  return (
    <div>
      <p style={{ marginBlockEnd: '0.75rem' }}>
        Define a template once with createPortalSlot, then reuse it through any
        number of SlotTargets.
      </p>

      <PortalSlot>
        {({ title }) => (
          <div
            style={{
              padding: '8px 12px',
              border: '1px solid #8884',
              borderRadius: '8px',
              marginBlockEnd: '8px',
            }}
          >
            <strong>{title}</strong>
            <p style={{ margin: 0 }}>
              This block is rendered from a single template, with data passed
              through SlotTarget props.
            </p>
          </div>
        )}
      </PortalSlot>

      <SlotTarget title="First usage" />
      <SlotTarget title="Second usage" />
    </div>
  )
}
