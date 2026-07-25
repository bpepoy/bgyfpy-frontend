// src/screens/LeagueScreen.jsx
// Handles all /fantasy/league/* sub-screens with SectionNav

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import SectionNav from '../components/shell/SectionNav'
import LeagueRecordsTab from './LeagueRecordsTab'

const API = 'https://bgyfpy-backend.onrender.com'

const GOLD       = '#D4A843'
const GOLD_DIM   = 'rgba(212,168,67,0.15)'
const GOLD_BORDER= 'rgba(212,168,67,0.3)'
const BG_CARD    = '#1e1e1e'
const BG_ROW     = '#252525'
const TEXT_1     = '#F0E6CC'
const TEXT_2     = '#A89060'
const TEXT_3     = '#967843'
const GREEN      = '#5DBF6A'

const TABS = [
  { key: 'rules',     label: 'Rules',     icon: '/icons/rules-icon.png'       },
  { key: 'history',   label: 'History',   icon: '/icons/history-icon.png'     },
  { key: 'records',   label: 'Records',   icon: '/icons/records-icon.png'     },
  { key: 'analytics', label: 'Analytics', icon: '/icons/analytics-icon-1.png' },
]

// ── shared helpers ────────────────────────────────────────────────────────────

function SectionHeader({ label }) {
  return (
    <div style={{
      fontSize: 9, color: TEXT_3, letterSpacing: '0.12em',
      textTransform: 'uppercase', padding: '16px 14px 6px',
    }}>
      {label}
    </div>
  )
}

function Card({ children, style }) {
  return (
    <div style={{
      background: BG_CARD, borderRadius: 12,
      border: `0.5px solid ${GOLD_BORDER}`,
      margin: '0 14px 10px', overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}

function Row({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '11px 14px',
      borderBottom: last ? 'none' : `0.5px solid rgba(212,168,67,0.1)`,
    }}>
      <span style={{ fontSize: 12, color: TEXT_2 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: TEXT_1 }}>{value}</span>
    </div>
  )
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{
      display: 'flex', margin: '12px 14px 0',
      background: BG_CARD, borderRadius: 10,
      border: `0.5px solid ${GOLD_BORDER}`,
      padding: 3, gap: 3,
    }}>
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          style={{
            flex: 1, padding: '7px 4px',
            borderRadius: 8, border: 'none', cursor: 'pointer',
            background: value === opt.key ? GOLD_DIM : 'transparent',
            borderWidth: value === opt.key ? 1 : 0,
            borderStyle: 'solid',
            borderColor: value === opt.key ? GOLD : 'transparent',
            fontSize: 9, letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: value === opt.key ? GOLD : TEXT_3,
            fontWeight: value === opt.key ? 600 : 400,
            transition: 'all 0.15s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ── RULES screen ──────────────────────────────────────────────────────────────

const RULE_SEGMENTS = [
  { key: 'league',  label: 'League' },
  { key: 'scoring', label: 'Scoring' },
  { key: 'payout',  label: 'Payouts' },
]

// Position display order & colors
const STARTER_COLOR = '#5DBF6A'   // green for all starters
const BENCH_COLOR   = '#5B9BD5'   // blue for bench
const IR_COLOR      = '#CF5F5F'   // red for IR

function RosterGrid({ positions }) {
  if (!positions?.length) return null
  // Expand positions by count into individual slots
  const slots = []
  positions.forEach(p => {
    const count = p.count || 1
    for (let i = 0; i < count; i++) slots.push(p.position)
  })
  // Separate starters from bench/IR
  const starters = slots.filter(p => p !== 'BN' && p !== 'IR' && p !== 'IR+')
  const bench    = slots.filter(p => p === 'BN')
  const ir       = slots.filter(p => p === 'IR' || p === 'IR+')

  const SlotChip = ({ pos, role = 'starter' }) => {
    const color = role === 'bench' ? BENCH_COLOR : role === 'ir' ? IR_COLOR : STARTER_COLOR
    return (
      <div style={{
        padding: '5px 10px', borderRadius: 6,
        background: `${color}22`,
        border: `1px solid ${color}66`,
        fontSize: 11, fontWeight: 600,
        color: color,
        letterSpacing: '0.04em',
      }}>
        {pos}
      </div>
    )
  }

  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 9, color: TEXT_3, letterSpacing: '0.1em', marginBottom: 8 }}>
        STARTERS
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {starters.map((pos, i) => <SlotChip key={i} pos={pos} role="starter" />)}
      </div>
      {bench.length > 0 && <>
        <div style={{ fontSize: 9, color: TEXT_3, letterSpacing: '0.1em', marginBottom: 8 }}>
          BENCH
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {bench.map((_, i) => <SlotChip key={i} pos="BN" role="bench" />)}
        </div>
      </>}
      {ir.length > 0 && <>
        <div style={{ fontSize: 9, color: TEXT_3, letterSpacing: '0.1em', marginBottom: 8 }}>
          INJURED RESERVE
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ir.map((pos, i) => <SlotChip key={i} pos={pos} role="ir" />)}
        </div>
      </>}
    </div>
  )
}

function LeagueRulesTab({ data }) {
  const [segment, setSegment] = useState('league')
  if (!data) return null

  const payout = data.payout_rules || {}
  const tradeDeadline = data.trade_deadline
    ? new Date(data.trade_deadline).toLocaleDateString('en-US', {month:'short', day:'numeric'})
    : '—'

  // Scoring stats — only show stats that actually score points
  const scoringStats = (data.scoring_stats || [])
    .filter(s => s.points_per_unit && s.points_per_unit !== 0 && !s.is_only_display_stat)
    .sort((a, b) => (b.points_per_unit || 0) - (a.points_per_unit || 0))

  // Season prizes — exclude the note field
  const seasonPrizes = Object.entries(payout.season_prizes || {})
    .filter(([k]) => k !== 'note' && typeof payout.season_prizes[k] === 'number')

  // Weekly prizes — exclude notes and non-numeric
  const weeklyPrizes = Object.entries(payout.weekly_prizes || {})
    .filter(([k]) => k !== 'note' && typeof payout.weekly_prizes[k] === 'number')

  const formatLabel = (k) =>
    k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <>
      <SegmentedControl
        options={RULE_SEGMENTS}
        value={segment}
        onChange={setSegment}
      />

      {segment === 'league' && (
        <>
          <SectionHeader label={`${data.year} League Rules`} />
          <Card>
            <Row label="Draft Type"        value={(data.draft_type || '—').toUpperCase()} />
            <Row label="Teams"             value={data.num_teams || '—'} />
            <Row label="FAAB Budget"       value={data.uses_faab ? `$${data.faab_budget}` : 'No FAAB'} />
            <Row label="Playoff Teams"     value={data.playoff_teams || '—'} />
            <Row label="Playoff Starts"    value={`Week ${data.playoff_start_week || '—'}`} />
            <Row label="Regular Season"    value={`Weeks 1–${data.playoff_start_week - 1 || '—'}`} />
            <Row label="Trade Deadline"    value={tradeDeadline} last />
          </Card>
          <SectionHeader label="Roster Slots" />
          <Card>
            <RosterGrid positions={data.roster_positions} />
          </Card>
        </>
      )}

      {segment === 'scoring' && (() => {
        // Group stats by position category
        const GROUP_ORDER = ['QB', 'WR/TE', 'RB', 'DEF', 'K', 'Other']
        const GROUP_KEYWORDS = {
          'QB':    ['pass', 'sack', 'interception thrown', 'fumble lost'],
          'WR/TE': ['receiv', 'reception', 'target', 'catch'],
          'RB':    ['rush', 'carry', 'carries'],
          'DEF':   ['defense', 'def', 'return', 'block', 'safety', 'point allow', 'yard allow', 'turnover', 'td allow', 'sack'],
          'K':     ['field goal', 'extra point', 'pat ', 'fg ', 'xp '],
        }
        const getGroup = (stat) => {
          const name = (stat.name || '').toLowerCase()
          if (GROUP_KEYWORDS.QB.some(k => name.includes(k)))    return 'QB'
          if (GROUP_KEYWORDS['WR/TE'].some(k => name.includes(k))) return 'WR/TE'
          if (GROUP_KEYWORDS.RB.some(k => name.includes(k)))    return 'RB'
          if (GROUP_KEYWORDS.K.some(k => name.includes(k)))     return 'K'
          if (GROUP_KEYWORDS.DEF.some(k => name.includes(k)))   return 'DEF'
          return 'Other'
        }
        const grouped = {}
        scoringStats.forEach(s => {
          const g = getGroup(s)
          if (!grouped[g]) grouped[g] = []
          grouped[g].push(s)
        })
        return (
          <>
            {GROUP_ORDER.filter(g => grouped[g]?.length).map(group => (
              <div key={group}>
                <SectionHeader label={group} />
                <Card>
                  {grouped[group].map((s, i) => (
                    <Row
                      key={s.stat_id}
                      label={s.name}
                      value={`${s.points_per_unit > 0 ? '+' : ''}${s.points_per_unit} pts`}
                      last={i === grouped[group].length - 1}
                    />
                  ))}
                </Card>
              </div>
            ))}
          </>
        )
      })()}

      {segment === 'payout' && (
        <>
          <SectionHeader label={`${data.year} Entry & Pot`} />
          <Card>
            <Row label="Entry Fee"      value={`$${payout.entry_fee || '—'}`} />
            <Row label="Total Pot"      value={`$${payout.total_pot || '—'}`} />
            <Row label="Season Prizes"  value={`$${payout.pot_breakdown?.season_prizes || '—'}`} />
            <Row label="Weekly Prizes"  value={`$${payout.pot_breakdown?.weekly_prizes || '—'}`} last />
          </Card>
          <SectionHeader label="Season Prizes" />
          <Card>
            {seasonPrizes.map(([k, v], i) => (
              <Row
                key={k}
                label={formatLabel(k)}
                value={`$${v}`}
                last={i === seasonPrizes.length - 1}
              />
            ))}
          </Card>
          {payout.season_prizes?.note && (
            <div style={{
              margin: '0 14px 10px', padding: '8px 12px',
              background: 'rgba(212,168,67,0.06)',
              border: '0.5px solid var(--gold-border)',
              borderRadius: 8, fontSize: 10, color: TEXT_2, lineHeight: 1.5,
            }}>
              {payout.season_prizes.note}
            </div>
          )}
          <SectionHeader label="Weekly Prizes" />
          <Card>
            {weeklyPrizes.map(([k, v], i) => (
              <Row
                key={k}
                label={formatLabel(k)}
                value={typeof v === 'number' && k.includes('week') ? `${v}` : `$${v}`}
                last={i === weeklyPrizes.length - 1}
              />
            ))}
          </Card>
          {payout.weekly_prizes?.note && (
            <div style={{
              margin: '0 14px 10px', padding: '8px 12px',
              background: 'rgba(212,168,67,0.06)',
              border: '0.5px solid var(--gold-border)',
              borderRadius: 8, fontSize: 10, color: TEXT_2, lineHeight: 1.5,
            }}>
              {payout.weekly_prizes.note}
            </div>
          )}
        </>
      )}
      <div style={{ height: 20 }} />
    </>
  )
}

// ── HISTORY screen ────────────────────────────────────────────────────────────

function SeasonCard({ season, isOpen, onOpen }) {
  const open = isOpen
  const cardRef = useRef(null)

  useEffect(() => {
    if (isOpen && cardRef.current) {
      setTimeout(() => {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)  // small delay lets the card expand first
    }
  }, [isOpen])

  const champ = season.champion || {}
  const last  = season.last_place || {}
  const bestPF= season.best_pf_avg || {}
  const tops  = season.top_scorers || {}
  const draft = season.draft_key_picks || {}
  const rostered = season.most_rostered_nfl_team || {}

  const fmtRecord = (m) => {
    if (!m?.wins && m?.wins !== 0) return '—'
    return m.ties ? `${m.wins}–${m.losses}–${m.ties}` : `${m.wins}–${m.losses}`
  }

  return (
    <div ref={cardRef} style={{
      margin: '0 14px 10px',
      borderRadius: 12,
      border: `0.5px solid ${open ? 'rgba(212,168,67,0.4)' : GOLD_BORDER}`,
      background: BG_CARD,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Tappable header — always visible */}
      <div
        onClick={() => onOpen()}
        style={{
          display: 'flex', alignItems: 'center',
          padding: '12px 14px', cursor: 'pointer',
          background: open ? 'rgba(212,168,67,0.06)' : 'transparent',
          gap: 12,
        }}
      >
        {/* Year badge */}
        <div style={{
          fontSize: 13, fontWeight: 600, color: GOLD,
          background: 'rgba(212,168,67,0.12)',
          border: `1px solid rgba(212,168,67,0.3)`,
          borderRadius: 8, padding: '4px 10px',
          flexShrink: 0,
        }}>
          {season.year}
        </div>
        {/* Champion headline */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: TEXT_1, display: 'flex', alignItems: 'center', gap: 5 }}>
            🏆 {champ.display_name}
          </div>
          <div style={{ fontSize: 10, color: TEXT_2, marginTop: 2 }}>
            {champ.team_name} · {fmtRecord(champ)}
          </div>
        </div>
        {/* Expand chevron */}
        <div style={{
          fontSize: 12, color: TEXT_3,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          flexShrink: 0,
        }}>▼</div>
      </div>

      {/* Tap hint when collapsed */}
      {!open && (
        <div style={{
          padding: '0 14px 10px',
          fontSize: 9, color: TEXT_3, letterSpacing: '0.08em',
        }}>
          TAP TO SEE FULL SEASON ▼
        </div>
      )}

      {/* Expanded content */}
      {open && (
        <div style={{ borderTop: `0.5px solid rgba(212,168,67,0.12)` }}>

          {/* Season snapshot */}
          <div style={{ padding: '10px 14px 4px' }}>
            <div style={{ fontSize: 9, color: TEXT_3, letterSpacing: '0.1em', marginBottom: 8 }}>
              SEASON SNAPSHOT
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '🏆 Champion',    name: champ.display_name,       val: fmtRecord(champ),  color: GREEN },
                { label: '💩 Last Place',  name: last.display_name,        val: fmtRecord(last),   color: '#CF5F5F' },
                { label: '📋 Best Record', name: (season.best_record || champ).display_name, val: fmtRecord(season.best_record || champ), color: '#5B9BD5' },
                { label: '📊 Most PF',     name: bestPF.display_name,      val: bestPF.avg_points_for ? `${bestPF.avg_points_for.toFixed(1)}/wk` : '—', color: GOLD },
              ].map(item => (
                <div key={item.label} style={{
                  background: BG_ROW, borderRadius: 8, padding: '8px 10px',
                }}>
                  <div style={{ fontSize: 8, color: TEXT_3, marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: item.color }}>{item.name}</div>
                  {item.val && <div style={{ fontSize: 10, color: TEXT_2, marginTop: 1 }}>{item.val}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Punishment */}
          {season.punishment && (
            <div style={{
              margin: '8px 14px', padding: '8px 12px',
              background: 'rgba(207,95,95,0.08)',
              border: '0.5px solid rgba(207,95,95,0.25)',
              borderRadius: 8, fontSize: 11, color: '#CF7070', lineHeight: 1.45,
            }}>
              💩 {season.punishment}
            </div>
          )}

          {/* Top scorers */}
          {Object.keys(tops).length > 0 && (
            <div style={{ padding: '10px 14px 4px' }}>
              <div style={{ fontSize: 9, color: TEXT_3, letterSpacing: '0.1em', marginBottom: 8 }}>
                TOP SCORERS
              </div>
              {['QB','WR','RB','TE'].filter(pos => tops[pos]).map(pos => {
                const p = tops[pos]
                const posColors = { QB:'#E07B54', WR:'#5B9BD5', RB:'#5DBF6A', TE:'#D4A843' }
                return (
                  <div key={pos} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 0',
                    borderBottom: '0.5px solid rgba(212,168,67,0.08)',
                  }}>
                    <div style={{
                      fontSize: 9, fontWeight: 700, color: posColors[pos],
                      background: `${posColors[pos]}22`,
                      border: `1px solid ${posColors[pos]}44`,
                      borderRadius: 4, padding: '2px 6px', flexShrink: 0,
                    }}>{pos}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: TEXT_1 }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: TEXT_2 }}>{p.owner?.display_name} · {p.nfl_team}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: GOLD }}>
                      {p.total_pts?.toFixed(1)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Top draft pick */}
          {draft.picks?.length > 0 && (
            <div style={{ padding: '10px 14px 4px' }}>
              <div style={{ fontSize: 9, color: TEXT_3, letterSpacing: '0.1em', marginBottom: 8 }}>
                TOP DRAFT PICKS {draft.type === 'auction' ? '(AUCTION)' : '(SNAKE)'}
              </div>
              {draft.picks.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 0',
                  borderBottom: i < draft.picks.length - 1 ? '0.5px solid rgba(212,168,67,0.08)' : 'none',
                }}>
                  <div style={{ fontSize: 11, color: TEXT_3, width: 18, textAlign: 'right' }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: TEXT_1 }}>{p.player_name}</div>
                    <div style={{ fontSize: 10, color: TEXT_2 }}>
                      {p.display_name} · {p.position} · {p.nfl_team}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {draft.type === 'auction'
                      ? <div style={{ fontSize: 12, fontWeight: 500, color: GOLD }}>${p.cost}</div>
                      : <div style={{ fontSize: 12, fontWeight: 500, color: GOLD }}>Pick #{p.pick || p.overall_pick}</div>
                    }
                    {(p.draft_label || p.pts_label) && (
                      <div style={{ fontSize: 9, color: TEXT_2 }}>
                        {p.draft_label} → {p.pts_label}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Most rostered NFL team */}
          {rostered.nfl_team && (
            <div style={{
              margin: '8px 14px 12px', padding: '8px 12px',
              background: 'rgba(212,168,67,0.06)',
              border: '0.5px solid var(--gold-border)',
              borderRadius: 8, display: 'flex', justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 9, color: TEXT_3, marginBottom: 2 }}>MOST ROSTERED NFL TEAM</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: TEXT_1 }}>{rostered.nfl_team}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: GOLD }}>
                {rostered.unique_players} players
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

function LeagueHistoryTab({ data }) {
  if (!data) return null
  const history = [...(data.history || [])].sort((a, b) => b.year - a.year)
  const [openYear, setOpenYear] = useState(history[0]?.year || null)

  return (
    <>
      <div style={{ padding: '12px 14px 4px' }}>
        <div style={{ fontSize: 9, color: TEXT_3, letterSpacing: '0.1em' }}>
          {history.length} SEASONS · TAP ANY SEASON TO EXPAND
        </div>
      </div>
      {history.map((season) => (
        <SeasonCard
          key={season.year}
          season={season}
          isOpen={openYear === season.year}
          onOpen={() => setOpenYear(y => y === season.year ? null : season.year)}
        />
      ))}
      <div style={{ height: 20 }} />
    </>
  )
}
// ── ANALYTICS screen ──────────────────────────────────────────────────────────

function LeagueAnalyticsTab({ data }) {
  if (!data) return (
    <div style={{ padding: 40, textAlign: 'center', color: TEXT_3, fontSize: 12 }}>
      Run /league/data/analytics/build-all to generate analytics data.
    </div>
  )

  const wl = data.wl_records?.era_blocks?.overall || {}

  return (
    <>
      <SectionHeader label="All-Time Win %" />
      <Card>
        {Object.entries(wl)
          .sort((a, b) => (b[1].actual?.total?.win_pct || 0) - (a[1].actual?.total?.win_pct || 0))
          .map(([mid, m], i, arr) => {
            const act = m.actual?.total || {}
            const pct = act.win_pct ? (act.win_pct * 100).toFixed(1) : '—'
            const rec = `${act.w || 0}–${act.l || 0}`
            return (
              <div key={mid} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px',
                borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid rgba(212,168,67,0.08)`,
              }}>
                <span style={{ fontSize: 11, color: TEXT_3, width: 18, textAlign: 'right' }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: TEXT_1 }}>{m.display_name}</div>
                  <div style={{ fontSize: 10, color: TEXT_2 }}>{rec}</div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: GOLD }}>{pct}%</span>
              </div>
            )
          })}
      </Card>
      <div style={{ height: 20 }} />
    </>
  )
}

// ── main screen ───────────────────────────────────────────────────────────────

export default function LeagueScreen() {
  const [activeTab, setActiveTab] = useState('rules')
  const [rulesData,     setRulesData]     = useState(null)
  const [historyData,   setHistoryData]   = useState(null)
  const [recordsData,   setRecordsData]   = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState({})

  const fetchTab = async (tab) => {
    if (loading[tab]) return
    setLoading(prev => ({ ...prev, [tab]: true }))
    try {
      const endpoints = {
        rules:     '/fantasy/league/rules',
        history:   '/fantasy/league/history',
        records:   '/fantasy/league/records',
        analytics: '/fantasy/league/analytics',
      }
      const res  = await fetch(`${API}${endpoints[tab]}`)
      const data = await res.json()
      const setters = {
        rules:     setRulesData,
        history:   setHistoryData,
        records:   setRecordsData,
        analytics: setAnalyticsData,
      }
      setters[tab](data)
    } catch (e) {
      console.error(`Failed to load ${tab}:`, e)
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }))
    }
  }

  // Load rules on mount, lazy-load others on tab switch
  useEffect(() => { fetchTab('rules') }, [])
  useEffect(() => {
    if (activeTab === 'history'   && !historyData)   fetchTab('history')
    if (activeTab === 'records'   && !recordsData)   fetchTab('records')
    if (activeTab === 'analytics' && !analyticsData) fetchTab('analytics')
  }, [activeTab])

  const isLoading = loading[activeTab]

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
      <SectionNav tabs={TABS} activeKey={activeTab} onSelect={setActiveTab} />

      {isLoading ? (
        <div style={{
          padding: 40, textAlign: 'center',
          color: TEXT_3, fontSize: 12, letterSpacing: '0.08em',
        }}>
          Loading…
        </div>
      ) : (
        <>
          {activeTab === 'rules'     && <LeagueRulesTab     data={rulesData}     />}
          {activeTab === 'history'   && <LeagueHistoryTab   data={historyData}   />}
          {activeTab === 'records'   && <LeagueRecordsTab data={recordsData}/>}
          {activeTab === 'analytics' && <LeagueAnalyticsTab data={analyticsData} />}
        </>
      )}
    </div>
  )
}