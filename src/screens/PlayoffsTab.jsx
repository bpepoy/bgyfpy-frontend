// src/screens/PlayoffsTab.jsx
import { useState, useEffect } from 'react'
import Avatar from '../components/Avatar'

const API         = 'https://bgyfpy-backend.onrender.com'
const GOLD        = '#D4A843'
const GOLD_DIM    = 'rgba(212,168,67,0.15)'
const GOLD_BORDER = 'rgba(212,168,67,0.3)'
const BG_CARD     = '#1e1e1e'
const BG_SURFACE  = '#171717'
const TEXT_1      = '#F0E6CC'
const TEXT_2      = '#A89060'
const TEXT_3      = '#967843'
const GREEN       = '#5DBF6A'
const RED         = '#CF5F5F'

const INITIALS = {
  blake:'BJ', brian:'BP', frank:'FL', jake:'JK',
  joey:'JY', jordan:'JM', kyle:'KB', nick:'ND', rob:'RD', zef:'ZD'
}
const POS_COLORS = { QB:'#E07B54', WR:'#5B9BD5', RB:'#5DBF6A', TE:'#D4A843', DEF:'#888', K:'#A87DC8', 'W/R/T':'#C8A050' }

const POS_SLOT_ORDER = ['QB','WR','RB','TE','W/R/T','W/R','K','DEF','BN','IR']

function posOrder(p) {
  const slot = p.selected_position || p.position || ''
  const idx  = POS_SLOT_ORDER.indexOf(slot)
  return idx === -1 ? 99 : idx
}

function sortRoster(players) {
  if (!players?.length) return []
  return [...players].sort((a, b) => posOrder(a) - posOrder(b))
}

// ── Season Navigator ──────────────────────────────────────────────────────────
function SeasonNav({ years, currentYear, onChange }) {
  const [showPicker, setShowPicker] = useState(false)
  const idx = years.indexOf(currentYear)
  const hasPrev = idx < years.length - 1
  const hasNext = idx > 0
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, padding:'10px 14px 6px' }}>
      <button onClick={() => hasPrev && onChange(years[idx+1])} disabled={!hasPrev}
        style={{ width:32, height:32, borderRadius:'50%', border:`0.5px solid ${hasPrev?GOLD_BORDER:'rgba(255,255,255,0.06)'}`,
          background:BG_CARD, cursor:hasPrev?'pointer':'default',
          display:'flex', alignItems:'center', justifyContent:'center', color:hasPrev?GOLD:TEXT_3, fontSize:14 }}>‹</button>
      <div style={{ position:'relative' }}>
        <button onClick={() => setShowPicker(p=>!p)}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:20,
            border:`1px solid ${GOLD_BORDER}`, background:GOLD_DIM, cursor:'pointer',
            fontSize:13, fontWeight:500, color:GOLD }}>
          Season {currentYear} <span style={{ fontSize:9, color:TEXT_2 }}>▼</span>
        </button>
        {showPicker && (
          <div style={{ position:'absolute', top:'110%', left:'50%', transform:'translateX(-50%)',
            background:'#1a1a1a', border:`0.5px solid ${GOLD_BORDER}`, borderRadius:10, zIndex:20,
            minWidth:140, maxHeight:240, overflowY:'auto', boxShadow:'0 8px 24px rgba(0,0,0,0.6)' }}>
            {years.map(yr => (
              <div key={yr} onClick={() => { onChange(yr); setShowPicker(false) }}
                style={{ padding:'10px 16px', cursor:'pointer', fontSize:13,
                  fontWeight:yr===currentYear?500:400, color:yr===currentYear?GOLD:TEXT_2,
                  background:yr===currentYear?GOLD_DIM:'transparent',
                  borderBottom:`0.5px solid rgba(212,168,67,0.08)` }}>
                {yr}
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => hasNext && onChange(years[idx-1])} disabled={!hasNext}
        style={{ width:32, height:32, borderRadius:'50%', border:`0.5px solid ${hasNext?GOLD_BORDER:'rgba(255,255,255,0.06)'}`,
          background:BG_CARD, cursor:hasNext?'pointer':'default',
          display:'flex', alignItems:'center', justifyContent:'center', color:hasNext?GOLD:TEXT_3, fontSize:14 }}>›</button>
    </div>
  )
}

// ── Matchup popup ─────────────────────────────────────────────────────────────
function MatchupModal({ matchup, onClose }) {
  if (!matchup) return null
  const [teamA, teamB] = matchup.teams || []
  if (!teamA || !teamB) return null
  const sort = (ps) => sortRoster(ps||[])
  const pA = sort(teamA.players), pB = sort(teamB.players)
  const maxRows = Math.max(pA.length, pB.length)
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.92)',
      display:'flex', flexDirection:'column', overflowY:'auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 16px', background:BG_SURFACE, borderBottom:`0.5px solid ${GOLD_BORDER}`,
        position:'sticky', top:0, zIndex:10, flexShrink:0 }}>
        <div style={{ fontSize:11, color:TEXT_2, letterSpacing:'0.08em' }}>WEEK {matchup.week} MATCHUP</div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:TEXT_2, fontSize:22, cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', padding:'14px 16px',
        gap:8, alignItems:'center', background:BG_SURFACE, flexShrink:0 }}>
        {[teamA, teamB].map((t,ti) => (
          <div key={ti} style={{ display:'flex', flexDirection:'column', alignItems:ti===0?'flex-start':'flex-end' }}>
            <Avatar managerId={t.manager_id} size={36}/>
            <div style={{ fontSize:13, fontWeight:500, color:TEXT_1, marginTop:5 }}>{t.display_name}</div>
            <div style={{ fontSize:10, color:TEXT_2 }}>{t.team_name}</div>
            <div style={{ fontSize:22, fontWeight:600, marginTop:4, color:t.is_winner?GREEN:RED }}>{t.points?.toFixed(1)}</div>
          </div>
        ))}
        <div style={{ textAlign:'center', fontSize:10, color:TEXT_3 }}>VS</div>
      </div>
      <div style={{ padding:'0 0 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 40px 1fr', padding:'6px 12px',
          borderBottom:`0.5px solid ${GOLD_BORDER}` }}>
          {[teamA.display_name.toUpperCase(), 'POS', teamB.display_name.toUpperCase()].map((h,i) => (
            <span key={i} style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.1em', textAlign:i===2?'right':'left' }}>{h}</span>
          ))}
        </div>
        {Array.from({length:maxRows}).map((_,i) => {
          const a=pA[i], b=pB[i]
          const pos = a?.selected_position||b?.selected_position||'—'
          const pc = POS_COLORS[pos]||TEXT_3
          return (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 40px 1fr', padding:'7px 12px',
              alignItems:'center', borderBottom:`0.5px solid rgba(212,168,67,0.06)`,
              background:a?.is_on_bench||b?.is_on_bench?'rgba(91,155,213,0.04)':a?.is_on_ir||b?.is_on_ir?'rgba(207,95,95,0.04)':'transparent' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
                {a?<><span style={{ fontSize:11, fontWeight:500, color:TEXT_1 }}>{a.name}</span>
                    <span style={{ fontSize:9, color:TEXT_3 }}>{a.nfl_team}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:a.week_pts>0?TEXT_1:TEXT_3 }}>{a.week_pts?.toFixed(1)??'—'}</span>
                  </>:<span style={{ fontSize:10, color:TEXT_3 }}>—</span>}
              </div>
              <div style={{ display:'flex', justifyContent:'center' }}>
                <div style={{ fontSize:8, fontWeight:700, color:pc, background:`${pc}22`,
                  border:`1px solid ${pc}44`, borderRadius:4, padding:'2px 5px', textAlign:'center' }}>{pos}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:1, alignItems:'flex-end' }}>
                {b?<><span style={{ fontSize:11, fontWeight:500, color:TEXT_1 }}>{b.name}</span>
                    <span style={{ fontSize:9, color:TEXT_3 }}>{b.nfl_team}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:b.week_pts>0?TEXT_1:TEXT_3 }}>{b.week_pts?.toFixed(1)??'—'}</span>
                  </>:<span style={{ fontSize:10, color:TEXT_3 }}>—</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Bracket team row ──────────────────────────────────────────────────────────
function BracketTeam({ team, showConnector }) {
  if (!team) return (
    <div style={{ padding:'8px 10px', borderBottom:showConnector?`0.5px solid rgba(212,168,67,0.1)`:'none' }}>
      <span style={{ fontSize:10, color:TEXT_3 }}>TBD</span>
    </div>
  )
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 10px',
      borderBottom:showConnector?`0.5px solid rgba(212,168,67,0.1)`:'none',
      background:team.is_winner?'rgba(93,191,106,0.05)':'transparent' }}>
      <Avatar managerId={team.manager_id} size={22}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, fontWeight:500, color:team.is_winner?TEXT_1:TEXT_2,
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {team.display_name}
        </div>
        <div style={{ fontSize:8, color:TEXT_3 }}>Seed {team.seed}</div>
      </div>
      <div style={{ fontSize:12, fontWeight:600, color:team.is_winner?GREEN:RED, flexShrink:0 }}>
        {team.points?.toFixed(1)}
      </div>
    </div>
  )
}

// ── Bracket matchup box ───────────────────────────────────────────────────────
function BracketBox({ matchup, label, onClick }) {
  if (!matchup) return (
    <div style={{ background:BG_CARD, borderRadius:8,
      border:`0.5px solid rgba(212,168,67,0.12)`, padding:'8px 10px',
      display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:9, color:TEXT_3 }}>TBD</span>
    </div>
  )
  const [a, b] = matchup.teams || []
  return (
    <div onClick={onClick} style={{ background:BG_CARD, borderRadius:8,
      border:`0.5px solid ${GOLD_BORDER}`, overflow:'hidden', cursor:'pointer' }}>
      {label && (
        <div style={{ fontSize:7, color:TEXT_3, letterSpacing:'0.1em', textTransform:'uppercase',
          padding:'4px 10px', borderBottom:`0.5px solid rgba(212,168,67,0.08)`,
          background:'rgba(212,168,67,0.04)' }}>
          {label}
        </div>
      )}
      <BracketTeam team={a} showConnector />
      <BracketTeam team={b} showConnector={false}/>
    </div>
  )
}

// ── Connector line ────────────────────────────────────────────────────────────
function Connector() {
  return (
    <div style={{ display:'flex', alignItems:'center', flexShrink:0, width:24 }}>
      <div style={{ width:'100%', height:0.5, background:GOLD_BORDER }}/>
    </div>
  )
}

// ── Champion roster ───────────────────────────────────────────────────────────
function ChampionRoster({ roster }) {
  if (!roster) return null
  const starters = (roster.players||[]).filter(p=>p.is_starting&&!p.is_on_bench)
  const bench    = (roster.players||[]).filter(p=>p.is_on_bench)
  return (
    <div style={{ margin:'16px 14px 0' }}>
      <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', marginBottom:8 }}>
        🏆 CHAMPION ROSTER · {roster.display_name} · {roster.total_playoff_pts?.toFixed(1)} playoff pts
      </div>
      <div style={{ background:BG_CARD, borderRadius:10, border:`0.5px solid ${GOLD_BORDER}`, overflow:'hidden' }}>
        {starters.map((p,i) => {
          const pc = POS_COLORS[p.selected_position]||TEXT_3
          return (
            <div key={p.player_key||i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 12px',
              borderBottom:`0.5px solid rgba(212,168,67,0.06)` }}>
              <div style={{ fontSize:8, fontWeight:700, color:pc, background:`${pc}22`,
                border:`1px solid ${pc}44`, borderRadius:4, padding:'2px 5px',
                minWidth:34, textAlign:'center', flexShrink:0 }}>{p.selected_position}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, color:TEXT_1, fontWeight:500 }}>{p.name}</div>
                <div style={{ fontSize:9, color:TEXT_3 }}>{p.nfl_team}</div>
              </div>
              <div style={{ fontSize:12, fontWeight:500, color:GOLD }}>{p.playoff_pts?.toFixed(1)}</div>
            </div>
          )
        })}
        {bench.length>0 && (
          <div style={{ padding:'6px 12px 4px' }}>
            <div style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.1em', marginBottom:4 }}>BENCH</div>
            {bench.map((p,i) => (
              <div key={p.player_key||i} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0',
                borderBottom:i<bench.length-1?`0.5px solid rgba(212,168,67,0.06)`:'none' }}>
                <div style={{ fontSize:8, color:'#5B9BD5', background:'rgba(91,155,213,0.15)',
                  border:'1px solid rgba(91,155,213,0.3)', borderRadius:4, padding:'2px 5px',
                  minWidth:34, textAlign:'center', flexShrink:0 }}>BN</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, color:TEXT_2 }}>{p.name}</div>
                  <div style={{ fontSize:9, color:TEXT_3 }}>{p.nfl_team}</div>
                </div>
                <div style={{ fontSize:11, color:TEXT_2 }}>{p.playoff_pts?.toFixed(1)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main bracket layout ───────────────────────────────────────────────────────
function BracketView({ data, onSelectMatchup }) {
  const bracket = data?.bracket || []
  const semifinalWeek = bracket.find(w => !w.is_final_week)
  const finalWeek     = bracket.find(w => w.is_final_week)
  const sf1 = semifinalWeek?.semifinals?.[0]
  const sf2 = semifinalWeek?.semifinals?.[1]
  const champ     = finalWeek?.championship
  const third     = finalWeek?.third_place

  return (
    <div style={{ padding:'8px 14px' }}>
      {/* Bracket title */}
      <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', marginBottom:12, textAlign:'center' }}>
        PLAYOFF BRACKET · TAP ANY MATCHUP FOR ROSTER DETAIL
      </div>

      {/* Main bracket grid: SF | connector | Finals */}
      <div style={{ display:'flex', alignItems:'center', gap:0 }}>

        {/* Left: Semifinals */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.1em', textAlign:'center', marginBottom:4 }}>
            SEMIFINALS
          </div>
          <BracketBox matchup={sf1} label={`Week ${sf1?.week||'—'}`}
            onClick={() => sf1 && onSelectMatchup(sf1)}/>
          <BracketBox matchup={sf2} label={`Week ${sf2?.week||'—'}`}
            onClick={() => sf2 && onSelectMatchup(sf2)}/>
        </div>

        {/* Connectors */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:24, gap:0 }}>
          <div style={{ flex:1, borderRight:`0.5px solid ${GOLD_BORDER}`, borderTop:`0.5px solid ${GOLD_BORDER}`,
            alignSelf:'stretch', marginTop:38 }}/>
          <div style={{ width:24, height:0.5, background:GOLD_BORDER }}/>
          <div style={{ flex:1, borderRight:`0.5px solid ${GOLD_BORDER}`, borderBottom:`0.5px solid ${GOLD_BORDER}`,
            alignSelf:'stretch', marginBottom:38 }}/>
        </div>

        {/* Right: Championship + 3rd place */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ fontSize:8, color:GOLD, letterSpacing:'0.1em', textAlign:'center', marginBottom:4 }}>
            🏆 CHAMPIONSHIP
          </div>
          <BracketBox matchup={champ} label={`Week ${champ?.week||'—'}`}
            onClick={() => champ && onSelectMatchup(champ)}/>
          <div style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.1em', textAlign:'center', marginTop:4 }}>
            🥉 3RD PLACE
          </div>
          <BracketBox matchup={third} label={`Week ${third?.week||'—'}`}
            onClick={() => third && onSelectMatchup(third)}/>
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function PlayoffsTab({ allData, years }) {
  const [year, setYear]               = useState(years?.[0])
  const [selectedMatchup, setSelected]= useState(null)
  const [cache, setCache]             = useState({})
  const [loading, setLoading]         = useState(false)

  useEffect(() => {
    if (!year) return
    if (cache[year]) return
    setLoading(true)
    fetch(`${API}/fantasy/season/playoffs/${year}`)
      .then(r => r.json())
      .then(d => { setCache(c => ({...c, [year]:d})); setLoading(false) })
      .catch(() => {
        // fallback to default endpoint for latest year
        fetch(`${API}/fantasy/season/playoffs`)
          .then(r => r.json())
          .then(d => { setCache(c => ({...c, [year]:d})); setLoading(false) })
          .catch(() => setLoading(false))
      })
  }, [year])

  const data = cache[year]

  return (
    <>
      {selectedMatchup && (
        <MatchupModal matchup={selectedMatchup} onClose={() => setSelected(null)}/>
      )}
      {years?.length > 0 && (
        <SeasonNav years={years} currentYear={year} onChange={setYear}/>
      )}
      {loading ? (
        <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>Loading…</div>
      ) : data ? (
        <>
          <BracketView data={data} onSelectMatchup={setSelected}/>
          <ChampionRoster roster={data.champion_roster}/>
          <div style={{ height:24 }}/>
        </>
      ) : (
        <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>
          No playoff data for {year}.
        </div>
      )}
    </>
  )
}