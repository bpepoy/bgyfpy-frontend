// src/components/shell/BottomNav.jsx
import { useNavigate, useLocation } from 'react-router-dom'
import Avatar from '../Avatar'

const FANTASY_TABS = [
  { key: 'league', label: 'League', icon: '/icons/league-icon.png', path: '/fantasy/league' },
  { key: 'season', label: 'Season', icon: '/icons/season-icon.png', path: '/fantasy/season' },
  { key: 'teams',  label: 'Teams',  icon: '/icons/teams-icon.png',  path: '/fantasy/teams'  },
]

const BETTING_TABS = [
  { key: 'parlays',    label: 'Parlays',    icon: '/icons/betting-icon.png',  path: '/betting/parlays'    },
  { key: 'water-bets', label: 'Water Bets', icon: '/icons/betting-icon.png',  path: '/betting/water-bets' },
  { key: 'season',     label: 'Season',     icon: '/icons/season-icon.png',   path: '/betting/season'     },
  { key: 'overall',    label: 'Overall',    icon: '/icons/league-icon.png',   path: '/betting/overall'    },
]

const MEDIA_TABS = [
  { key: 'content',      label: 'Content',    icon: '/icons/content-icon.png',      path: '/media/content'      },
  { key: 'punishment',   label: 'Punishment', icon: '/icons/punishment-icon-2.png', path: '/media/punishment'   },
  { key: 'ice-videos',   label: 'Ice Videos', icon: '/icons/ice-videos-icon.png',   path: '/media/ice-videos'   },
  { key: 'food-reviews', label: 'Food Reviews',icon: '/icons/food-reviews-icon.png',path: '/media/food-reviews' },
]

const TABS_BY_SECTION = {
  fantasy:  FANTASY_TABS,
  betting:  BETTING_TABS,
  media:    MEDIA_TABS,
}

export default function BottomNav({ user, section = 'fantasy' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const tabs = TABS_BY_SECTION[section] || FANTASY_TABS
  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <div
      className="flex items-center flex-shrink-0"
      style={{
        height:        72,
        background:    'var(--bg-surface)',
        borderTop:     '0.5px solid var(--gold-strong)',
        padding:       '0 6px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Profile avatar */}
      <button
        className="flex flex-col items-center gap-1"
        style={{ flex: 1 }}
        onClick={() => navigate(`/fantasy/manager/${user?.manager_id || 'brian'}`)}
        aria-label="My team"
      >
        <Avatar managerId={user?.manager_id} size={36}
        />
        <span style={{
          fontSize: 7, color: 'var(--text-2)',
          letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          {user?.display_name || 'Brian'}
        </span>
      </button>

      {/* Divider */}
      <div style={{ width: 0.5, height: 36, background: 'var(--gold-border)', flexShrink: 0 }} />

      {/* Nav tabs */}
      {tabs.map(tab => {
        const active = isActive(tab.path)
        return (
          <button
            key={tab.key}
            className="flex flex-col items-center gap-1"
            style={{ flex: 1 }}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
          >
            <div
              className="relative flex items-center justify-center rounded-full"
            >
              <img
                src={tab.icon}
                alt={tab.label}
                style={{
                  width: 36, height: 36, objectFit: 'contain',
                  opacity: active ? 1 : 0.4,
                }}
              />
              {active && (
                <div
                  className="absolute rounded-full"
                  style={{
                    width: 4, height: 4,
                    background: 'var(--gold)',
                    bottom: -8, left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                />
              )}
            </div>
            <span style={{
              fontSize: 7, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: active ? 'var(--gold)' : 'var(--text-3)',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}