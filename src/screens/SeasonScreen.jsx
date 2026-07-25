// src/screens/SeasonScreen.jsx
import { useState, useEffect, useRef } from 'react'
import SectionNav from '../components/shell/SectionNav'
import PlayoffsTab from './PlayoffsTab'
import TransactionsTab from './TransactionsTab'
import Avatar from '../components/Avatar'

const API = 'https://bgyfpy-backend.onrender.com'

const GOLD        = '#D4A843'
const GOLD_DIM    = 'rgba(212,168,67,0.15)'
const GOLD_BORDER = 'rgba(212,168,67,0.3)'
const BG_CARD     = '#1e1e1e'
const BG_ROW      = '#252525'
const TEXT_1      = '#F0E6CC'
const TEXT_2      = '#A89060'
const TEXT_3      = '#967843'
const GREEN       = '#5DBF6A'
const RED         = '#CF5F5F'

const TABS = [
  { key: 'standings',    label: 'Standings',    icon: '/icons/standings-icon.png'    },
  { key: 'playoffs',     label: 'Playoffs',     icon: '/icons/playoffs-icon.png'     },
  { key: 'transactions', label: 'Transactions', icon: '/icons/transactions-icon-1.png' },
  { key: 'analytics',    label: 'Analytics',    icon: '/icons/analytics-icon-2.png'  },
]

const INITIALS = {
  blake:'BJ', brian:'BP', frank:'FL', jake:'JK',
  joey:'JY', jordan:'JM', kyle:'KB', nick:'ND', rob:'RD', zef:'ZD'
}

// ── Season Navigator ──────────────────────────────────────────────────────────
function SeasonNav({ years, currentYear, onChange }) {
  const [showPicker, setShowPicker] = useState(false)
  const idx     = years.indexOf(currentYear)
  const hasPrev = idx < years.length - 1
  const hasNext = idx > 0

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: '10px 14px 4px',
    }}>
      {/* Back arrow */}
      <button
        onClick={() => hasPrev && onChange(years[idx + 1])}
        disabled={!hasPrev}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          border: `0.5px solid ${hasPrev ? GOLD_BORDER : 'rgba(255,255,255,0.06)'}`,
          background: BG_CARD, cursor: hasPrev ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: hasPrev ? GOLD : TEXT_3, fontSize: 14,
        }}
      >‹</button>

      {/* Season pill — tap to open dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowPicker(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 20,
            border: `1px solid ${GOLD_BORDER}`,
            background: GOLD_DIM, cursor: 'pointer',
            fontSize: 13, fontWeight: 500, color: GOLD,
            letterSpacing: '0.04em',
          }}
        >
          {currentYear}
          <span style={{ fontSize: 9, color: TEXT_2 }}>▼</span>
        </button>

        {/* Dropdown */}
        {showPicker && (
          <div style={{
            position: 'absolute', top: '110%', left: '50%',
            transform: 'translateX(-50%)',
            background: '#1a1a1a', border: `0.5px solid ${GOLD_BORDER}`,
            borderRadius: 10, zIndex: 20, minWidth: 140,
            maxHeight: 240, overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}>
            {years.map(yr => (
              <div
                key={yr}
                onClick={() => { onChange(yr); setShowPicker(false) }}
                style={{
                  padding: '10px 16px', cursor: 'pointer',
                  fontSize: 13, fontWeight: yr === currentYear ? 500 : 400,
                  color: yr === currentYear ? GOLD : TEXT_2,
                  background: yr === currentYear ? GOLD_DIM : 'transparent',
                  borderBottom: `0.5px solid rgba(212,168,67,0.08)`,
                }}
              >
                {yr}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Forward arrow */}
      <button
        onClick={() => hasNext && onChange(years[idx - 1])}
        disabled={!hasNext}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          border: `0.5px solid ${hasNext ? GOLD_BORDER : 'rgba(255,255,255,0.06)'}`,
          background: BG_CARD, cursor: hasNext ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: hasNext ? GOLD : TEXT_3, fontSize: 14,
        }}
      >›</button>
    </div>
  )
}

// ── Standings ─────────────────────────────────────────────────────────────────
function StandingsTab({ allSeasons }) {
  const years       = allSeasons.map(s => s.year).sort((a,b) => b - a)
  const [year, setYear] = useState(years[0])
  const season      = allSeasons.find(s => s.year === year) || {}
  const standings   = season.standings || []
  const isFinished  = season.is_finished
  const hasProj     = season.has_projected

  const playoff_line = season.standings?.filter(s => s.made_playoffs).length || 4

  return (
    <>
      <SeasonNav years={years} currentYear={year} onChange={setYear} />

      {/* Season badge */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '4px 14px 8px',
      }}>
        <span style={{ fontSize: 10, color: TEXT_3, letterSpacing: '0.1em' }}>
          {isFinished ? 'FINAL STANDINGS' : 'CURRENT STANDINGS'}
        </span>
        {!isFinished && (
          <span style={{
            fontSize: 8, color: GOLD, background: GOLD_DIM,
            border: `0.5px solid ${GOLD_BORDER}`,
            borderRadius: 10, padding: '2px 7px', letterSpacing: '0.08em',
          }}>LIVE</span>
        )}
      </div>

      {/* Header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '28px 36px 1fr 1fr 44px 44px 44px',
        padding: '6px 14px',
        borderBottom: `0.5px solid ${GOLD_BORDER}`,
      }}>
        {['#', '', 'Manager', 'Team', 'PF/G', hasProj ? 'PROJ' : '', 'PA/G'].map((h, i) => (
          <span key={i} style={{
            fontSize: 8, color: TEXT_3, letterSpacing: '0.08em',
            textTransform: 'uppercase', textAlign: i >= 3 ? 'right' : 'left',
          }}>{h}</span>
        ))}
      </div>

      {/* Standings rows */}
      <div style={{ margin: '0 0 16px' }}>
        {standings.map((mgr, i) => {
          const record = mgr.ties
            ? `${mgr.wins}–${mgr.losses}–${mgr.ties}`
            : `${mgr.wins}–${mgr.losses}`
          const isPlayoffLine = i === playoff_line - 1
          const inPlayoffs    = mgr.made_playoffs

          return (
            <div key={mgr.manager_id}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '28px 36px 1fr 1fr 44px 44px 44px',
                padding: '9px 14px', alignItems: 'center',
                background: inPlayoffs
                  ? 'rgba(93,191,106,0.04)'
                  : 'transparent',
                borderBottom: isPlayoffLine
                  ? `1.5px solid rgba(93,191,106,0.35)`
                  : `0.5px solid rgba(212,168,67,0.07)`,
              }}>
                {/* Seed */}
                <span style={{
                  fontSize: 11, color: inPlayoffs ? GREEN : TEXT_3,
                  fontWeight: inPlayoffs ? 600 : 400,
                }}>
                  {mgr.playoff_seed || i + 1}
                </span>

                {/* Avatar */}
                <Avatar managerId={mgr.manager_id} photoUrl={mgr.photo_url} size={28}/>

                {/* Name + record */}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: TEXT_1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {mgr.display_name}
                  </div>
                  <div style={{ fontSize: 9, color: TEXT_3, marginTop: 1 }}>{record}</div>
                </div>

                {/* Team name column */}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: TEXT_2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {mgr.team_name}
                  </div>
                </div>

                {/* PF/G */}
                <span style={{
                  fontSize: 12, color: GOLD,
                  textAlign: 'right', fontWeight: 500,
                }}>
                  {mgr.points_for_avg?.toFixed(1) || '—'}
                </span>

                {/* PROJ/G */}
                <span style={{
                  fontSize: 11, color: TEXT_2, textAlign: 'right',
                }}>
                  {hasProj && mgr.projected_avg ? mgr.projected_avg.toFixed(1) : '—'}
                </span>

                {/* PA/G */}
                <span style={{
                  fontSize: 11, color: TEXT_3, textAlign: 'right',
                }}>
                  {mgr.points_against_avg?.toFixed(1) || '—'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Playoff cutline legend */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 14px 16px',
      }}>
        <div style={{
          width: 20, height: 1.5,
          background: 'rgba(93,191,106,0.35)',
        }}/>
        <span style={{ fontSize: 9, color: TEXT_3 }}>Playoff cutline</span>
      </div>
    </>
  )
}

// ── Placeholder tabs ──────────────────────────────────────────────────────────
function ComingSoon({ label }) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 40,
      flexDirection: 'column', gap: 8,
    }}>
      <div style={{ fontSize: 24 }}>🚧</div>
      <div style={{ fontSize: 12, color: TEXT_3, letterSpacing: '0.08em' }}>
        {label} coming soon
      </div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function SeasonScreen() {
  const [activeTab, setActiveTab]     = useState('standings')
  const [standingsData, setStandings] = useState(null)
  const [loading, setLoading]         = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/fantasy/season/standings`)
      .then(r => r.json())
      .then(d => { setStandings(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])


  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
      <SectionNav tabs={TABS} activeKey={activeTab} onSelect={setActiveTab} />

      {loading ? (
        <div style={{
          padding: 40, textAlign: 'center',
          color: TEXT_3, fontSize: 12, letterSpacing: '0.08em',
        }}>
          Loading…
        </div>
      ) : (
        <>
          {activeTab === 'standings' && (
            <StandingsTab allSeasons={standingsData?.seasons || []} />
          )}
          {activeTab === 'playoffs' && (
            <PlayoffsTab
              years={(standingsData?.seasons||[]).map(s=>s.year).sort((a,b)=>b-a)}
            />
          )}
          {activeTab === 'analytics'    && <ComingSoon label="Analytics" />}
          {activeTab === 'transactions' && (
            <TransactionsTab
              years={(standingsData?.seasons||[]).map(s=>s.year).sort((a,b)=>b-a)}
            />
          )}
        </>
      )}
    </div>
  )
}