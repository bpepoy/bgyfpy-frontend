// src/screens/MatchupsTab.jsx
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

const ACTIVE_MEMBERS = ['blake','brian','frank','jake','joey','jordan','kyle','nick','rob','zef']
const INITIALS = {
  blake:'BJ', brian:'BP', frank:'FL', jake:'JK',
  joey:'JY', jordan:'JM', kyle:'KB', nick:'ND', rob:'RD', zef:'ZD'
}
const POS_COLORS = { QB:'#E07B54', WR:'#5B9BD5', RB:'#5DBF6A', TE:'#D4A843', DEF:'#888', K:'#A87DC8', 'W/R/T':'#C8A050', 'W/R':'#C8A050' }
const POS_ORDER  = ['QB','WR','WR','RB','RB','TE','W/R/T','W/R','W/R','K','DEF','BN','BN','BN','BN','BN','BN','BN','IR']

const ERA_OPTIONS = [
  { key:'all_time',    label:'All Time' },
  { key:'darkness',   label:'Raphi'    },
  { key:'sam_era',    label:'Sam'      },
  { key:'frank_era',  label:'Frank'    },
  { key:'jordan_era', label:'Jordan'   },
  { key:'auction_era',label:'Auction'  },
]

function posOrder(p) {
  const slot = p.selected_position || p.position || ''
  const idx  = POS_ORDER.indexOf(slot)
  return idx === -1 ? 99 : idx
}

// ── H2H Detail Modal ──────────────────────────────────────────────────────────
function H2HModal({ mgr1, mgr2, onClose }) {
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [expandedIdx, setExpanded] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/fantasy/teams/matchups/${mgr1}/vs/${mgr2}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [mgr1, mgr2])

  const rs      = data?.regular_season || {}
  const po      = data?.playoffs || {}
  const streak  = data?.rs_current_streak
  const allMatchups = data?.matchups || data?.last_5?.matchups || []

  const mgr1Name = data?.[mgr1]?.display_name || INITIALS[mgr1] || mgr1
  const mgr2Name = data?.[mgr2]?.display_name || INITIALS[mgr2] || mgr2

  const sortPlayers = (ps=[]) => [...ps].sort((a,b) => posOrder(a)-posOrder(b))

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200,
      background:'rgba(0,0,0,0.95)', display:'flex', flexDirection:'column',
      overflowY:'auto' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 16px', background:BG_SURFACE,
        borderBottom:`0.5px solid ${GOLD_BORDER}`,
        position:'sticky', top:0, zIndex:10, flexShrink:0 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:500, color:GOLD }}>
            {mgr1Name} vs {mgr2Name}
          </div>
          <div style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:1 }}>
            Head-to-Head
          </div>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none',
          color:TEXT_2, fontSize:22, cursor:'pointer', padding:4 }}>✕</button>
      </div>

      {loading ? (
        <div style={{ padding:60, textAlign:'center', color:TEXT_3, fontSize:12 }}>Loading…</div>
      ) : !data ? (
        <div style={{ padding:60, textAlign:'center', color:TEXT_3, fontSize:12 }}>No data found.</div>
      ) : (
        <div style={{ padding:'10px 12px 24px' }}>

          {/* VS header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'12px', background:BG_CARD, border:`0.5px solid ${GOLD_BORDER}`,
            borderRadius:12, marginBottom:10 }}>
            {[{id:mgr1,name:mgr1Name,w:rs.wins,l:rs.losses},{id:mgr2,name:mgr2Name,w:rs.losses,l:rs.wins}]
              .map((side, si) => (
              <div key={side.id} style={{ flex:1, display:'flex', flexDirection:'column',
                alignItems:'center', gap:5 }}>
                <Avatar managerId={side.id} size={38}/>
                <div style={{ fontSize:13, fontWeight:500, color:TEXT_1 }}>{side.name}</div>
                <div style={{ fontSize:12, fontWeight:500,
                  color:side.w > side.l ? GREEN : side.w < side.l ? RED : TEXT_2 }}>
                  {side.w}–{side.l}{rs.ties?`–${rs.ties}`:''}
                </div>
              </div>
            ))}
            <div style={{ fontSize:20, fontWeight:500, color:TEXT_3, padding:'0 8px' }}>vs</div>
          </div>

          {/* Streak */}
          {streak && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              padding:'7px 12px', background:`rgba(${streak.type==='W'?'93,191,106':'207,95,95'},0.08)`,
              border:`0.5px solid rgba(${streak.type==='W'?'93,191,106':'207,95,95'},0.2)`,
              borderRadius:8, marginBottom:10 }}>
              <span style={{ fontSize:9, color:TEXT_2, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                {mgr1Name}'s current streak
              </span>
              <span style={{ fontSize:13, fontWeight:500, color:streak.type==='W'?GREEN:RED }}>
                {streak.type}{streak.count}
              </span>
            </div>
          )}

          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6, marginBottom:10 }}>
            {[
              { label:'RS Games',  value:rs.games??'—' },
              { label:'Avg PF',    value:rs.avg_pf?.toFixed(1)??'—', gold:true },
              { label:'Avg PA',    value:rs.avg_pa?.toFixed(1)??'—' },
              { label:'PO Record', value:po.games?(po.wins+'-'+po.losses):'—' },
              { label:'Avg Diff',  value:rs.avg_diff!=null?`${rs.avg_diff>0?'+':''}${rs.avg_diff.toFixed(1)}`:'—',
                color:rs.avg_diff>0?GREEN:rs.avg_diff<0?RED:TEXT_2 },
              { label:'Total',     value:data.total_matchups??'—' },
            ].map(s => (
              <div key={s.label} style={{ background:BG_CARD, border:`0.5px solid rgba(212,168,67,0.18)`,
                borderRadius:9, padding:'8px 6px', textAlign:'center' }}>
                <div style={{ fontSize:8, color:TEXT_3, textTransform:'uppercase',
                  letterSpacing:'0.07em', marginBottom:3 }}>{s.label}</div>
                <div style={{ fontSize:14, fontWeight:500, color:s.color||s.gold?GOLD:TEXT_1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Last 5 pips */}
          {data.matchups?.length > 0 && (
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:9, color:TEXT_2, letterSpacing:'0.1em',
                textTransform:'uppercase', marginBottom:6 }}>LAST 5</div>
              <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                {data.matchups.map((m, i) => {
                  const mData = m[mgr1]
                  const isW   = mData?.is_winner
                  return (
                    <div key={i} style={{ width:28, height:28, borderRadius:6,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:10, fontWeight:600,
                      background:isW?'rgba(93,191,106,0.2)':'rgba(207,95,95,0.15)',
                      border:`0.5px solid ${isW?'rgba(93,191,106,0.3)':'rgba(207,95,95,0.25)'}`,
                      color:isW?GREEN:RED }}>
                      {isW?'W':'L'}
                    </div>
                  )
                })}
                <span style={{ fontSize:9, color:TEXT_3, marginLeft:4 }}>
                  ({data.wins}–{data.losses})
                </span>
              </div>
            </div>
          )}

          {/* Matchup history cards */}
          <div style={{ fontSize:9, color:TEXT_2, letterSpacing:'0.1em',
            textTransform:'uppercase', marginBottom:6 }}>MATCHUP HISTORY</div>

          {allMatchups.map((m, idx) => {
            const mA = m[mgr1] || {}
            const mB = m[mgr2] || {}
            const diff = mA.points && mB.points
              ? (mA.points - mB.points).toFixed(1)
              : null
            const isExpanded = expandedIdx === idx
            const hasPlayers = m.players_available && m.player_breakdown
            const pA = sortPlayers(m.player_breakdown?.[mgr1] || [])
            const pB = sortPlayers(m.player_breakdown?.[mgr2] || [])
            const maxRows = Math.max(pA.length, pB.length)

            return (
              <div key={idx} onClick={() => hasPlayers && setExpanded(i => i===idx?null:idx)}
                style={{ background:BG_CARD, border:`0.5px solid rgba(212,168,67,${m.is_playoffs?'0.4':'0.18'})`,
                  borderRadius:10, marginBottom:7, overflow:'hidden',
                  cursor:hasPlayers?'pointer':'default' }}>
                {/* Card top */}
                <div style={{ padding:'9px 11px' }}>
                  <div style={{ display:'flex', alignItems:'center',
                    justifyContent:'space-between', marginBottom:7 }}>
                    <div style={{ fontSize:9, color:TEXT_3 }}>
                      {m.year} · {m.week===0?'Pre':m.week===17?'Championship':`Week ${m.week}`}
                    </div>
                    <div style={{ fontSize:8, padding:'2px 7px', borderRadius:20, fontWeight:500,
                      background:m.is_playoffs?'rgba(212,168,67,0.15)':'rgba(74,58,26,0.3)',
                      color:m.is_playoffs?GOLD:TEXT_3,
                      border:`0.5px solid ${m.is_playoffs?'rgba(212,168,67,0.3)':'transparent'}` }}>
                      {m.is_playoffs?'Playoffs':'Regular Season'}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:9, color:TEXT_2, marginBottom:2 }}>{mA.team_name}</div>
                      <div style={{ fontSize:18, fontWeight:500,
                        color:mA.is_winner?TEXT_1:TEXT_3 }}>
                        {mA.points?.toFixed(1)??'—'}
                      </div>
                    </div>
                    {diff !== null && (
                      <div style={{ fontSize:11, fontWeight:500, padding:'0 8px',
                        color:parseFloat(diff)>0?GREEN:parseFloat(diff)<0?RED:TEXT_2 }}>
                        {parseFloat(diff)>0?'+':''}{diff}
                      </div>
                    )}
                    <div style={{ flex:1, textAlign:'right' }}>
                      <div style={{ fontSize:9, color:TEXT_2, marginBottom:2 }}>{mB.team_name}</div>
                      <div style={{ fontSize:18, fontWeight:500,
                        color:mB.is_winner?TEXT_1:TEXT_3 }}>
                        {mB.points?.toFixed(1)??'—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expand hint */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4,
                  padding:'0 11px 8px', fontSize:8, color:TEXT_3 }}>
                  {hasPlayers
                    ? <><span>Player breakdown</span>
                        <span style={{ transform:isExpanded?'rotate(180deg)':'none',
                          transition:'transform 0.2s', fontSize:10 }}>▼</span></>
                    : <span>No player data available</span>
                  }
                </div>

                {/* Player breakdown */}
                {isExpanded && hasPlayers && (
                  <div style={{ borderTop:`0.5px solid rgba(212,168,67,0.12)`, padding:'8px 10px' }}>
                    {/* Header */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 44px 1fr',
                      gap:4, paddingBottom:5, marginBottom:4,
                      borderBottom:`0.5px solid rgba(212,168,67,0.15)` }}>
                      <span style={{ fontSize:8, fontWeight:500, color:TEXT_2 }}>
                        {mgr1Name}
                      </span>
                      <span style={{ fontSize:8, color:TEXT_3, textAlign:'center' }}>POS</span>
                      <span style={{ fontSize:8, fontWeight:500, color:TEXT_2, textAlign:'right' }}>
                        {mgr2Name}
                      </span>
                    </div>
                    {/* Player rows */}
                    {Array.from({length:maxRows}).map((_,pi) => {
                      const pla = pA[pi], plb = pB[pi]
                      const pos = pla?.selected_position || plb?.selected_position || '—'
                      const posCol = POS_COLORS[pos] || TEXT_3
                      const aWins = pla?.week_pts != null && plb?.week_pts != null
                        ? pla.week_pts > plb.week_pts
                        : null
                      return (
                        <div key={pi} style={{ display:'grid', gridTemplateColumns:'1fr 44px 1fr',
                          gap:4, padding:'4px 0',
                          borderBottom:`0.5px solid rgba(212,168,67,0.06)`,
                          alignItems:'start' }}>
                          {/* Left */}
                          <div>
                            {pla ? <>
                              <div style={{ fontSize:11, fontWeight:500,
                                color:aWins===true?GREEN:aWins===false?RED:TEXT_2 }}>
                                {pla.week_pts?.toFixed(1)??'—'}
                              </div>
                              <div style={{ fontSize:9, color:TEXT_2, lineHeight:1.3 }}>
                                {pla.name?.split(' ').pop()}
                              </div>
                              {pla.is_on_bench && (
                                <div style={{ fontSize:7, color:'#5B9BD5' }}>BN</div>
                              )}
                            </> : <div style={{ fontSize:9, color:TEXT_3 }}>—</div>}
                          </div>
                          {/* Pos badge */}
                          <div style={{ textAlign:'center', paddingTop:2 }}>
                            <span style={{ fontSize:7, color:posCol,
                              background:`${posCol}22`, border:`0.5px solid ${posCol}44`,
                              borderRadius:4, padding:'1px 4px', display:'inline-block' }}>
                              {pos}
                            </span>
                          </div>
                          {/* Right */}
                          <div style={{ textAlign:'right' }}>
                            {plb ? <>
                              <div style={{ fontSize:11, fontWeight:500,
                                color:aWins===false?GREEN:aWins===true?RED:TEXT_2 }}>
                                {plb.week_pts?.toFixed(1)??'—'}
                              </div>
                              <div style={{ fontSize:9, color:TEXT_2, lineHeight:1.3 }}>
                                {plb.name?.split(' ').pop()}
                              </div>
                              {plb.is_on_bench && (
                                <div style={{ fontSize:7, color:'#5B9BD5', textAlign:'right' }}>BN</div>
                              )}
                            </> : <div style={{ fontSize:9, color:TEXT_3 }}>—</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── H2H Grid ──────────────────────────────────────────────────────────────────
function H2HGrid({ managers, current, era, onSelectCell }) {
  const [highlighted, setHighlighted] = useState(null)

  const active = managers
    .filter(m => ACTIVE_MEMBERS.includes(m.manager_id))
    .sort((a,b) => a.display_name.localeCompare(b.display_name))

  const getCell = (row, col, type='rs') => {
    // h2h may be nested under manager or under grid key
    const grid = current?.grid || {}
    const rowGrid = grid[row.manager_id] || {}
    const cell = rowGrid[col.manager_id] || (row.h2h||{})[col.manager_id]
    if (!cell) return null
    if (type === 'rs') return cell.regular_season || null
    if (type === 'po') return cell.playoffs || null
    return null
  }

  return (
    <div>
      {/* RS Grid */}
      <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', padding:'12px 14px 6px' }}>
        REGULAR SEASON RECORD
      </div>
      <div style={{ margin:'0 14px', overflowX:'auto' }}>
        <div style={{ minWidth: active.length * 38 + 70 }}>
          {/* Col headers */}
          <div style={{ display:'flex', paddingLeft:70, marginBottom:2 }}>
            {active.map(m => (
              <div key={m.manager_id} style={{ width:38, flexShrink:0, textAlign:'center',
                fontSize:8, color: highlighted===m.manager_id ? GOLD : TEXT_3,
                fontWeight: highlighted===m.manager_id ? 600 : 400,
                paddingBottom:4 }}>
                {INITIALS[m.manager_id]||m.display_name.slice(0,2).toUpperCase()}
              </div>
            ))}
          </div>
          {/* Rows */}
          {active.map((row, ri) => {
            const isHighlighted = highlighted === row.manager_id
            return (
              <div key={row.manager_id}
                onClick={() => setHighlighted(h => h===row.manager_id?null:row.manager_id)}
                style={{ display:'flex', alignItems:'center', cursor:'pointer',
                  borderBottom:`0.5px solid rgba(212,168,67,0.06)`,
                  background: isHighlighted?'rgba(212,168,67,0.06)':'transparent',
                  border: isHighlighted?`0.5px solid rgba(212,168,67,0.25)`:'0.5px solid transparent',
                  borderRadius: isHighlighted?6:0, marginBottom:1 }}>
                {/* Row label */}
                <div style={{ width:70, flexShrink:0, display:'flex', alignItems:'center',
                  gap:5, padding:'5px 0 5px 4px' }}>
                  <Avatar managerId={row.manager_id} size={20}/>
                  <span style={{ fontSize:9, color:isHighlighted?GOLD:TEXT_2,
                    fontWeight:isHighlighted?600:400 }}>
                    {row.display_name}
                  </span>
                </div>
                {/* Cells */}
                {active.map(col => {
                  const isSelf = row.manager_id === col.manager_id
                  const cell   = getCell(row, col, 'rs')
                  const isColHighlighted = highlighted === col.manager_id
                  if (isSelf) return (
                    <div key={col.manager_id} style={{ width:38, flexShrink:0, textAlign:'center',
                      fontSize:9, color:TEXT_3,
                      background:'rgba(255,255,255,0.02)', padding:'5px 0' }}>—</div>
                  )
                  const w=cell?.wins??0, l=cell?.losses??0
                  const pct = (w+l)>0 ? w/(w+l) : null
                  const color = pct===null?TEXT_3:pct>0.5?GREEN:pct<0.5?RED:TEXT_2
                  const bg = (isHighlighted||isColHighlighted) ? 'rgba(212,168,67,0.08)' : 'transparent'
                  return (
                    <div key={col.manager_id}
                      onClick={e => { e.stopPropagation();
                        onSelectCell(row.manager_id, col.manager_id) }}
                      style={{ width:38, flexShrink:0, textAlign:'center',
                        padding:'5px 0', fontSize:9, fontWeight:500, color,
                        background:bg, cursor:'pointer',
                        borderRadius:4 }}>
                      {cell ? `${w}-${l}` : '—'}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* PO Grid */}
      <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', padding:'16px 14px 6px' }}>
        PLAYOFF RECORD
      </div>
      <div style={{ margin:'0 14px', overflowX:'auto' }}>
        <div style={{ minWidth: active.length * 38 + 70 }}>
          <div style={{ display:'flex', paddingLeft:70, marginBottom:2 }}>
            {active.map(m => (
              <div key={m.manager_id} style={{ width:38, flexShrink:0, textAlign:'center',
                fontSize:8, color:TEXT_3, paddingBottom:4 }}>
                {INITIALS[m.manager_id]||m.display_name.slice(0,2).toUpperCase()}
              </div>
            ))}
          </div>
          {active.map((row) => (
            <div key={row.manager_id} style={{ display:'flex', alignItems:'center',
              borderBottom:`0.5px solid rgba(212,168,67,0.06)` }}>
              <div style={{ width:70, flexShrink:0, display:'flex', alignItems:'center',
                gap:5, padding:'5px 0 5px 4px' }}>
                <Avatar managerId={row.manager_id} size={20}/>
                <span style={{ fontSize:9, color:TEXT_2 }}>{row.display_name}</span>
              </div>
              {active.map(col => {
                const isSelf = row.manager_id === col.manager_id
                const cell   = getCell(row, col, 'po')
                if (isSelf) return (
                  <div key={col.manager_id} style={{ width:38, flexShrink:0, textAlign:'center',
                    fontSize:9, color:TEXT_3,
                    background:'rgba(255,255,255,0.02)', padding:'5px 0' }}>—</div>
                )
                const w=cell?.wins??0, l=cell?.losses??0
                if (!cell || (w+l)===0) return (
                  <div key={col.manager_id} style={{ width:38, flexShrink:0, textAlign:'center',
                    padding:'5px 0', fontSize:9, color:TEXT_3 }}>—</div>
                )
                const pct = w/(w+l)
                const color = pct>0.5?GREEN:pct<0.5?RED:TEXT_2
                return (
                  <div key={col.manager_id}
                    onClick={() => onSelectCell(row.manager_id, col.manager_id)}
                    style={{ width:38, flexShrink:0, textAlign:'center',
                      padding:'5px 0', fontSize:9, fontWeight:500, color, cursor:'pointer' }}>
                    {w}-{l}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'8px 14px 4px', fontSize:9, color:TEXT_3 }}>
        Tap a row to highlight · Tap a cell to see matchup detail
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function MatchupsTab({ data }) {
  const [era, setEra]           = useState('all_time')
  const [eraData, setEraData]   = useState({})
  const [loading, setLoading]   = useState(false)
  const [mgr1, setMgr1]         = useState('')
  const [mgr2, setMgr2]         = useState('')
  const [modal, setModal]       = useState(null)  // {mgr1, mgr2}

  useEffect(() => {
    if (eraData[era]) return
    setLoading(true)
    fetch(`${API}/fantasy/teams/matchups?era=${era}`)
      .then(r => r.json())
      .then(d => { setEraData(prev => ({...prev, [era]:d})); setLoading(false) })
      .catch(() => setLoading(false))
  }, [era])

  const current  = eraData[era]
  const managers = current?.managers || (data?.managers || [])


  const activeOpts = managers
    .filter(m => ACTIVE_MEMBERS.includes(m.manager_id))
    .sort((a,b) => a.display_name.localeCompare(b.display_name))

  const selectStyle = {
    flex:1, padding:'8px 10px', borderRadius:8, border:`0.5px solid ${GOLD_BORDER}`,
    background:BG_CARD, color:TEXT_1, fontSize:12, cursor:'pointer',
    appearance:'none', WebkitAppearance:'none',
  }

  return (
    <div style={{ paddingBottom:24 }}>
      {/* Matchup detail modal */}
      {modal && (
        <H2HModal mgr1={modal.mgr1} mgr2={modal.mgr2} onClose={() => setModal(null)}/>
      )}

      {/* Manager picker */}
      <div style={{ margin:'10px 14px 0', background:BG_CARD, borderRadius:12,
        border:`0.5px solid ${GOLD_BORDER}`, padding:'12px' }}>
        <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', marginBottom:8 }}>
          SEE MATCHUP DETAILS
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          <select value={mgr1} onChange={e => setMgr1(e.target.value)} style={selectStyle}>
            <option value="">Manager 1</option>
            {activeOpts.map(m => (
              <option key={m.manager_id} value={m.manager_id}>{m.display_name}</option>
            ))}
          </select>
          <select value={mgr2} onChange={e => setMgr2(e.target.value)} style={selectStyle}>
            <option value="">Manager 2</option>
            {activeOpts.filter(m => m.manager_id !== mgr1).map(m => (
              <option key={m.manager_id} value={m.manager_id}>{m.display_name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => mgr1 && mgr2 && setModal({mgr1, mgr2})}
          disabled={!mgr1 || !mgr2}
          style={{ width:'100%', padding:'9px', borderRadius:8, border:'none', cursor:'pointer',
            background: mgr1 && mgr2 ? GOLD_DIM : 'rgba(255,255,255,0.04)',
            borderWidth:1, borderStyle:'solid',
            borderColor: mgr1 && mgr2 ? GOLD : 'rgba(255,255,255,0.06)',
            fontSize:11, fontWeight:600,
            color: mgr1 && mgr2 ? GOLD : TEXT_3 }}>
          See Matchup Details →
        </button>
      </div>

      {/* Era pills */}
      <div style={{ display:'flex', gap:6, padding:'12px 14px 4px', overflowX:'auto' }}>
        {ERA_OPTIONS.map(e => (
          <button key={e.key} onClick={() => setEra(e.key)}
            style={{ padding:'5px 10px', borderRadius:14, border:'none', cursor:'pointer',
              background:era===e.key?GOLD_DIM:'rgba(255,255,255,0.04)',
              borderWidth:era===e.key?1:0.5, borderStyle:'solid',
              borderColor:era===e.key?GOLD:'rgba(255,255,255,0.06)',
              fontSize:9, color:era===e.key?GOLD:TEXT_3,
              fontWeight:era===e.key?600:400, flexShrink:0, whiteSpace:'nowrap' }}>
            {e.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>Loading…</div>
      ) : (
        <H2HGrid
          managers={managers}
          current={current}
          era={era}
          onSelectCell={(m1, m2) => setModal({mgr1:m1, mgr2:m2})}
        />
      )}
    </div>
  )
}