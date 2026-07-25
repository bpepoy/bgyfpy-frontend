// src/components/ui/Avatar.jsx
// Circle avatar — shows photo if available, falls back to initials

export default function Avatar({
  initials   = '??',
  photoUrl   = null,
  size       = 36,      // px
  gold       = false,   // gold border (profile avatar)
  active     = false,   // gold border + bg (active nav state)
  className  = '',
}) {
  const border = gold || active
    ? '1.5px solid var(--gold)'
    : '0.5px solid var(--gold-border)'

  const bg = active
    ? 'var(--gold-dim)'
    : photoUrl
      ? 'transparent'
      : 'var(--bg-card)'

  return (
    <div
      className={`flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width:  size,
        height: size,
        border,
        background: bg,
        fontSize:   Math.round(size * 0.3),
        fontWeight: 500,
        color:      'var(--gold)',
      }}
    >
      {photoUrl
        ? <img src={photoUrl} alt={initials} className="w-full h-full object-cover" />
        : <span>{initials}</span>
      }
    </div>
  )
}
