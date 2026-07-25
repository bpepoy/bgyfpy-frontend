// src/components/shell/PillBar.jsx
// Scrollable pill row for section sub-navigation
// pills = [{key, label, icon?}]

import * as TablerIcons from '@tabler/icons-react'

function getIcon(iconName) {
  if (!iconName) return null
  // Convert kebab-case to PascalCase with Icon prefix
  // e.g. "layout-dashboard" → "IconLayoutDashboard"
  const pascal = iconName
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
  return TablerIcons[`Icon${pascal}`] || null
}

export default function PillBar({ pills = [], activeKey, onSelect }) {
  if (!pills.length) return null

  return (
    <div
      className="flex gap-1 scroll-hide flex-shrink-0"
      style={{
        overflowX:    'auto',
        padding:      '7px 10px',
        background:   'var(--bg-surface)',
        borderBottom: '0.5px solid var(--gold-subtle)',
      }}
    >
      {pills.map(pill => {
        const active = pill.key === activeKey
        const Icon   = getIcon(pill.icon)

        return (
          <button
            key={pill.key}
            onClick={() => onSelect(pill.key)}
            className="flex items-center gap-1 flex-shrink-0 rounded-full"
            style={{
              padding:    '4px 12px',
              fontSize:   9,
              fontWeight: active ? 500 : 400,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              background: active ? 'var(--gold-dim)'    : 'var(--bg-card)',
              border:     active
                ? '0.5px solid var(--gold-strong)'
                : '0.5px solid var(--gold-border)',
              color: active ? 'var(--gold)' : 'var(--text-2)',
              transition: 'all 0.15s',
            }}
          >
            {Icon && <Icon size={11} />}
            {pill.label}
          </button>
        )
      })}
    </div>
  )
}
