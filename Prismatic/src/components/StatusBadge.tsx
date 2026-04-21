type Status = 'connected' | 'not_connected' | 'loading'

interface StatusBadgeProps {
  status: Status
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'loading') {
    return (
      <span className="int-badge int-badge--loading">
        <span className="int-badge__dot int-badge__dot--pulse" />
        Connecting
      </span>
    )
  }
  if (status === 'connected') {
    return (
      <span className="int-badge int-badge--connected">
        <span className="int-badge__dot" />
        Connected
      </span>
    )
  }
  return (
    <span className="int-badge int-badge--disconnected">
      <span className="int-badge__dot" />
      Not Connected
    </span>
  )
}
