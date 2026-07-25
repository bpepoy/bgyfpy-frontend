// src/components/shell/HamburgerMenu.jsx
import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  { key: 'home',          label: 'HOME',          icon: '/icons/home-icon.png',          path: '/',          soon: false },
  { key: 'fantasy',       label: 'FANTASY',       icon: '/icons/fantasy-icon.png',       path: '/fantasy/league', soon: false },
  { key: 'media',         label: 'MEDIA',         icon: '/icons/media-icon.png',         path: '/media/content',  soon: false },
  { key: 'betting',       label: 'BETTING',       icon: '/icons/betting-icon.png',       path: '/betting/parlays',soon: false },
  { key: 'basketball',    label: 'BASKETBALL',    icon: '/icons/basketball-icon.png',    path: null,         soon: true  },
  { key: 'nfl-playoffs',  label: 'NFL PLAYOFFS',  icon: '/icons/nfl-playoffs-icon.png',  path: null,         soon: true  },
  { key: 'march-madness', label: 'MARCH MADNESS', icon: '/icons/march-madness-icon.png', path: null,         soon: true  },
]

const SETTINGS_ITEMS = [
  { key: 'profile',      label: 'PROFILE',          icon: '/icons/profile-icon.png'           },
  { key: 'upload',       label: 'UPLOAD',            icon: '/icons/upload-icon.png'            },
  { key: 'proposal',     label: 'RULE PROPOSAL',     icon: '/icons/rule-proposal-icon.png'     },
  { key: 'voting',       label: 'VOTING',            icon: '/icons/voting-icon.png'            },
  { key: 'notification', label: 'PUSH NOTIFICATION', icon: '/icons/push-notification-icon.png' },
  { key: 'refresh',      label: 'REFRESH DATA',      icon: '/icons/refresh-data-icon.png'      },
]

export default function HamburgerMenu({ open, onClose, currentSection }) {
  const navigate = useNavigate()

  const handleNav = (path) => {
    if (path) { navigate(path); onClose() }
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position:   'fixed', top: 0, left: 0, bottom: 0,
          width:      220,
          background: '#111111',
          borderRight:'0.5px solid var(--gold-border)',
          zIndex:     50,
          transform:  open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          display:    'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding:      '16px 16px 12px',
          borderBottom: '0.5px solid var(--gold-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/icons/blackgold-logo.png" alt="BG"
              style={{ width: 32, height: 32, borderRadius: 6 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gold)' }}>
                BLACKGOLD
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                SELECT SECTION
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-2)', fontSize: 20, cursor: 'pointer', padding: 4,
            }}
          >✕</button>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {SECTIONS.map(s => {
            const isActive = currentSection === s.key
            return (
              <div
                key={s.key}
                onClick={() => !s.soon && handleNav(s.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 18px',
                  cursor:  s.soon ? 'default' : 'pointer',
                  opacity: s.soon ? 0.4 : 1,
                  background: isActive ? 'var(--gold-dim)' : 'transparent',
                }}
              >
                {/* Icon circle */}
                <div style={{
                }}>
                  <img src={s.icon} alt={s.label}
                    style={{ width: 36, height: 36, objectFit: 'contain' }} />
                </div>

                <span style={{
                  fontSize: 11, fontWeight: 500,
                  color: isActive ? 'var(--gold)' : 'var(--text-1)',
                  letterSpacing: '0.08em',
                }}>
                  {s.label}
                </span>

                {s.soon && (
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 8, letterSpacing: '0.1em',
                    color: 'var(--text-3)',
                    background: 'var(--gold-dim)',
                    border: '0.5px solid var(--text-3)',
                    borderRadius: 10, padding: '2px 6px',
                  }}>
                    SOON
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}