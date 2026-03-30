interface Props {
  shape: string
  size?: number
}

export function ShapeIcon({ shape, size = 14 }: Props) {
  if (shape === '★') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill="#F5A623"
        />
      </svg>
    )
  }
  if (shape === '●') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
        <circle cx="12" cy="12" r="10" fill="#5B9BD5" />
      </svg>
    )
  }
  if (shape === '■') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
        <rect x="2" y="2" width="20" height="20" rx="5" fill="#5BB87A" />
      </svg>
    )
  }
  return null
}

export function ShapeLabel({ label }: { label: string }) {
  const shapes = label.split(',').map(s => s.trim()).filter(Boolean)
  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
      {shapes.map((s, i) => (
        <ShapeIcon key={i} shape={s} size={13} />
      ))}
    </div>
  )
}
