// src/components/shell/SectionNav.jsx
// Scrollable icon pill nav — used across all Fantasy sub-sections

export default function SectionNav({ tabs, activeKey, onSelect }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: 24,
      padding: '14px 14px 6px',
    }}>
      {tabs.map(tab => {
        const active = activeKey === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => onSelect(tab.key)}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 5,
              padding: '6px 8px',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <img
              src={tab.icon}
              alt={tab.label}
              style={{
                width: 36, height: 36, objectFit: 'contain',
                opacity: active ? 1 : 0.35,
              }}
            />
            <span style={{
              fontSize: 8, letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: active ? 'var(--gold)' : 'var(--text-3)',
              whiteSpace: 'nowrap',
            }}>
              {tab.label}
            </span>
            {/* Active underline dot */}
            <div style={{
              width: active ? 16 : 0,
              height: 2,
              borderRadius: 1,
              background: 'var(--gold)',
              transition: 'width 0.2s ease',
            }} />
          </button>
        )
      })}
    </div>
  )
}