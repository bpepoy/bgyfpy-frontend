// src/screens/TransactionsTab.jsx
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

const POS_COLORS = { QB:'#E07B54', WR:'#5B9BD5', RB:'#5DBF6A', TE:'#D4A843', DEF:'#888', K:'#A87DC8' }

const INITIALS = {
  blake:'BJ', brian:'BP', frank:'FL', jake:'JK',
  joey:'JY', jordan:'JM', kyle:'KB', nick:'ND', rob:'RD', zef:'ZD'
}

function PosChip({ pos }) {
  const c = POS_COLORS[pos] || TEXT_3
  return (
    <span style={{ fontSize:8, fontWeight:700, color:c, background:`${c}22`,
      border:`1px solid ${c}44`, borderRadius:4, padding:'1px 5px', flexShrink:0 }}>{pos}</span>
  )
}

// ── Season Navigator ──────────────────────────────────────────────────────────
function SeasonNav({ years, currentYear, onChange }) {
  const [showPicker, setShowPicker] = useState(false)
  const idx=years.indexOf(currentYear), hasPrev=idx<years.length-1, hasNext=idx>0
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, padding:'10px 14px 6px' }}>
      <button onClick={() => hasPrev&&onChange(years[idx+1])} disabled={!hasPrev}
        style={{ width:32, height:32, borderRadius:'50%', border:`0.5px solid ${hasPrev?GOLD_BORDER:'rgba(255,255,255,0.06)'}`,
          background:BG_CARD, cursor:hasPrev?'pointer':'default', display:'flex', alignItems:'center',
          justifyContent:'center', color:hasPrev?GOLD:TEXT_3, fontSize:14 }}>‹</button>
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
                  color:yr===currentYear?GOLD:TEXT_2, background:yr===currentYear?GOLD_DIM:'transparent',
                  borderBottom:`0.5px solid rgba(212,168,67,0.08)` }}>{yr}</div>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => hasNext&&onChange(years[idx-1])} disabled={!hasNext}
        style={{ width:32, height:32, borderRadius:'50%', border:`0.5px solid ${hasNext?GOLD_BORDER:'rgba(255,255,255,0.06)'}`,
          background:BG_CARD, cursor:hasNext?'pointer':'default', display:'flex', alignItems:'center',
          justifyContent:'center', color:hasNext?GOLD:TEXT_3, fontSize:14 }}>›</button>
    </div>
  )
}

// ── Moves popup ───────────────────────────────────────────────────────────────

function groupMoves(moves) {
  // Pair adds+drops that share the same manager_id and date (same transaction)
  const adds  = moves.filter(m => m.type === 'add')
  const drops = moves.filter(m => m.type === 'drop')
  const used  = new Set()
  const rows  = []

  adds.forEach(add => {
    // Look for a matching drop: same manager, same date
    const matchIdx = drops.findIndex(
      d => !used.has(d) && d.manager_id === add.manager_id && d.date === add.date
    )
    if (matchIdx !== -1) {
      used.add(drops[matchIdx])
      rows.push({ type:'pair', add, drop:drops[matchIdx] })
    } else {
      rows.push({ type:'add', add })
    }
  })

  // Remaining unmatched drops
  drops.forEach(d => {
    if (!used.has(d)) rows.push({ type:'drop', drop:d })
  })

  // Sort by date
  rows.sort((a,b) => {
    const da = (a.add||a.drop)?.date || ''
    const db = (b.add||b.drop)?.date || ''
    return da.localeCompare(db)
  })
  return rows
}

function MoveRow({ row }) {
  if (row.type === 'pair') {
    const { add, drop } = row
    return (
      <div style={{ borderBottom:`0.5px solid rgba(212,168,67,0.06)`,
        background:'rgba(212,168,67,0.02)' }}>
        {/* Manager + date header */}
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px 3px' }}>
          <Avatar managerId={add.manager_id} size={18}/>
          <span style={{ fontSize:10, color:TEXT_2 }}>{add.display_name}</span>
          {add.waiver_bid != null && (
            <span style={{ fontSize:9, color:GOLD }}>FAAB ${add.waiver_bid}</span>
          )}
          <span style={{ fontSize:9, color:TEXT_3, marginLeft:'auto' }}>{add.date}</span>
        </div>
        {/* Add row */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 16px' }}>
          <div style={{ width:18, height:18, borderRadius:4, flexShrink:0,
            background:'rgba(93,191,106,0.15)', border:'1px solid rgba(93,191,106,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:9, fontWeight:700, color:GREEN }}>+</div>
          <span style={{ fontSize:12, fontWeight:500, color:TEXT_1 }}>{add.player_name}</span>
          <PosChip pos={add.position}/>
          <span style={{ fontSize:9, color:TEXT_3 }}>{add.nfl_team}</span>
        </div>
        {/* Drop row */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 16px 7px' }}>
          <div style={{ width:18, height:18, borderRadius:4, flexShrink:0,
            background:'rgba(207,95,95,0.15)', border:'1px solid rgba(207,95,95,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:9, fontWeight:700, color:RED }}>–</div>
          <span style={{ fontSize:12, color:TEXT_2 }}>{drop.player_name}</span>
          <PosChip pos={drop.position}/>
          <span style={{ fontSize:9, color:TEXT_3 }}>{drop.nfl_team}</span>
        </div>
      </div>
    )
  }

  const m = row.add || row.drop
  const isAdd = row.type === 'add'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 16px',
      borderBottom:`0.5px solid rgba(212,168,67,0.06)`,
      background:isAdd?'rgba(93,191,106,0.04)':'rgba(207,95,95,0.04)' }}>
      <div style={{ width:32, height:32, borderRadius:6, flexShrink:0,
        background:isAdd?'rgba(93,191,106,0.15)':'rgba(207,95,95,0.15)',
        border:`1px solid ${isAdd?'rgba(93,191,106,0.3)':'rgba(207,95,95,0.3)'}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:10, fontWeight:700, color:isAdd?GREEN:RED }}>
        {isAdd?'+':'–'}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:13, fontWeight:500, color:TEXT_1 }}>{m.player_name}</span>
          <PosChip pos={m.position}/>
          <span style={{ fontSize:9, color:TEXT_3 }}>{m.nfl_team}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
          <Avatar managerId={m.manager_id} size={18}/>
          <span style={{ fontSize:10, color:TEXT_2 }}>{m.display_name}</span>
          {m.waiver_bid != null && <span style={{ fontSize:9, color:GOLD }}>FAAB ${m.waiver_bid}</span>}
        </div>
      </div>
      <div style={{ fontSize:9, color:TEXT_3, flexShrink:0 }}>{m.date}</div>
    </div>
  )
}

function MovesModal({ week, moves, onClose }) {
  const rows = groupMoves(moves)
  const pairs = rows.filter(r => r.type === 'pair').length
  const standalone = rows.filter(r => r.type !== 'pair').length
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.92)',
      display:'flex', flexDirection:'column', overflowY:'auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 16px', background:BG_SURFACE, borderBottom:`0.5px solid ${GOLD_BORDER}`,
        position:'sticky', top:0, zIndex:10, flexShrink:0 }}>
        <div>
          <div style={{ fontSize:11, color:TEXT_2, letterSpacing:'0.08em' }}>
            WEEK {week} MOVES
          </div>
          <div style={{ fontSize:9, color:TEXT_3, marginTop:2 }}>
            {pairs} add/drop pairs · {standalone} standalone
          </div>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:TEXT_2, fontSize:22, cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ padding:'8px 0 24px' }}>
        {rows.map((row, i) => <MoveRow key={i} row={row}/>)}
      </div>
    </div>
  )
}

// ── Trades popup ──────────────────────────────────────────────────────────────
function TradesModal({ week, trades, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.92)',
      display:'flex', flexDirection:'column', overflowY:'auto' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 16px', background:BG_SURFACE, borderBottom:`0.5px solid ${GOLD_BORDER}`,
        position:'sticky', top:0, zIndex:10, flexShrink:0 }}>
        <div style={{ fontSize:11, color:TEXT_2, letterSpacing:'0.08em' }}>
          WEEK {week} TRADES · {trades.length} total
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:TEXT_2, fontSize:22, cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ padding:'8px 16px 24px' }}>
        {trades.map((t, i) => (
          <div key={i} style={{ background:BG_CARD, borderRadius:10, border:`0.5px solid ${GOLD_BORDER}`,
            marginBottom:10, overflow:'hidden' }}>
            {/* Trade header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'8px 12px', borderBottom:`0.5px solid rgba(212,168,67,0.1)`,
              background:'rgba(212,168,67,0.04)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Avatar managerId={t.manager_a?.manager_id} size={22}/>
                <span style={{ fontSize:11, color:TEXT_1 }}>{t.manager_a?.display_name}</span>
              </div>
              <span style={{ fontSize:10, color:TEXT_3 }}>⇄</span>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:11, color:TEXT_1 }}>{t.manager_b?.display_name}</span>
                <Avatar managerId={t.manager_b?.manager_id} size={22}/>
              </div>
            </div>
            {/* Players exchanged */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
              <div style={{ padding:'8px 12px', borderRight:`0.5px solid rgba(212,168,67,0.1)` }}>
                <div style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.08em', marginBottom:5 }}>
                  {(t.manager_b?.display_name||'').toUpperCase()} RECEIVES
                </div>
                {(t.a_received||[]).map((p,j) => (
                  <div key={j} style={{ marginBottom:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <PosChip pos={p.position}/>
                      <span style={{ fontSize:11, color:TEXT_1 }}>{p.name}</span>
                    </div>
                    <div style={{ fontSize:9, color:TEXT_3, marginTop:1 }}>{p.nfl_team}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:'8px 12px' }}>
                <div style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.08em', marginBottom:5 }}>
                  {(t.manager_a?.display_name||'').toUpperCase()} RECEIVES
                </div>
                {(t.b_received||[]).map((p,j) => (
                  <div key={j} style={{ marginBottom:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <PosChip pos={p.position}/>
                      <span style={{ fontSize:11, color:TEXT_1 }}>{p.name}</span>
                    </div>
                    <div style={{ fontSize:9, color:TEXT_3, marginTop:1 }}>{p.nfl_team}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding:'4px 12px 6px', fontSize:9, color:TEXT_3 }}>{t.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Segmented control ─────────────────────────────────────────────────────────
function SegControl({ options, value, onChange }) {
  return (
    <div style={{ display:'flex', margin:'10px 14px 0', background:BG_CARD,
      borderRadius:10, border:`0.5px solid ${GOLD_BORDER}`, padding:3, gap:3 }}>
      {options.map(o => (
        <button key={o.key} onClick={() => onChange(o.key)}
          style={{ flex:1, padding:'7px 4px', borderRadius:8, border:'none', cursor:'pointer',
            background:value===o.key?GOLD_DIM:'transparent',
            borderWidth:value===o.key?1:0, borderStyle:'solid', borderColor:value===o.key?GOLD:'transparent',
            fontSize:10, letterSpacing:'0.07em', textTransform:'uppercase',
            color:value===o.key?GOLD:TEXT_3, fontWeight:value===o.key?600:400 }}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TransactionsTab({ years }) {
  const [year, setYear]           = useState(years?.[0])
  const [segment, setSegment]     = useState('moves')
  const [cache, setCache]         = useState({})
  const [loading, setLoading]     = useState(false)
  const [movesModal, setMovesModal]   = useState(null)
  const [tradesModal, setTradesModal] = useState(null)

  useEffect(() => {
    if (!year || cache[year]) return
    setLoading(true)
    const url = years?.indexOf(year) === 0
      ? `${API}/fantasy/season/transactions`
      : `${API}/fantasy/season/transactions/${year}`
    fetch(url)
      .then(r => r.json())
      .then(d => { setCache(c => ({...c,[year]:d})); setLoading(false) })
      .catch(() => setLoading(false))
  }, [year])

  const data   = cache[year]
  const weeks  = data?.weeks || []
  const draft  = data?.draft || {}
  const summary= data?.summary || {}

  return (
    <>
      {movesModal && (
        <MovesModal week={movesModal.week} moves={movesModal.moves} onClose={() => setMovesModal(null)}/>
      )}
      {tradesModal && (
        <TradesModal week={tradesModal.week} trades={tradesModal.trades} onClose={() => setTradesModal(null)}/>
      )}

      {years?.length > 0 && <SeasonNav years={years} currentYear={year} onChange={setYear}/>}
      <SegControl
        options={[{key:'moves',label:'Moves'},{key:'trades',label:'Trades'},{key:'draft',label:'Draft'}]}
        value={segment} onChange={setSegment}/>

      {loading ? (
        <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>Loading…</div>
      ) : !data ? (
        <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>No data for {year}.</div>
      ) : (
        <>
          {/* ── MOVES ── */}
          {segment === 'moves' && (
            <div style={{ padding:'10px 14px 24px' }}>
              {/* Summary tiles */}
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                {[
                  { label:'Total Moves', value:summary.total_moves },
                  { label:'Adds', value:summary.total_adds },
                  { label:'Drops', value:summary.total_drops },
                ].map(t => (
                  <div key={t.label} style={{ flex:1, background:BG_CARD, borderRadius:8,
                    border:`0.5px solid ${GOLD_BORDER}`, padding:'10px 8px', textAlign:'center' }}>
                    <div style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.08em', marginBottom:4 }}>{t.label}</div>
                    <div style={{ fontSize:22, fontWeight:500, color:GOLD }}>{t.value||0}</div>
                  </div>
                ))}
              </div>
              {/* Week table */}
              <div style={{ background:BG_CARD, borderRadius:10, border:`0.5px solid ${GOLD_BORDER}`, overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 60px 60px',
                  padding:'7px 12px', borderBottom:`0.5px solid ${GOLD_BORDER}` }}>
                  {['Week','','Adds','Drops'].map((h,i) => (
                    <span key={i} style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.08em',
                      textAlign:i>=2?'right':'left' }}>{h}</span>
                  ))}
                </div>
                {weeks.filter(w => w.total_moves > 0).map((w, i, arr) => (
                  <div key={w.week} onClick={() => w.moves?.length && setMovesModal({week:w.week, moves:w.moves})}
                    style={{ display:'grid', gridTemplateColumns:'60px 1fr 60px 60px',
                      padding:'10px 12px', alignItems:'center', cursor:w.moves?.length?'pointer':'default',
                      borderBottom:i<arr.length-1?`0.5px solid rgba(212,168,67,0.06)`:'none',
                      background:'transparent' }}>
                    <span style={{ fontSize:12, color:TEXT_2 }}>
                      {w.week === 0 ? 'Pre' : `Wk ${w.week}`}
                    </span>
                    <div style={{ height:4, borderRadius:2, background:'rgba(212,168,67,0.1)',
                      overflow:'hidden', margin:'0 8px' }}>
                      <div style={{ height:'100%', borderRadius:2, background:GOLD_DIM,
                        width:`${Math.min((w.total_moves/20)*100,100)}%` }}/>
                    </div>
                    <span style={{ fontSize:12, color:GREEN, textAlign:'right' }}>{w.total_adds}</span>
                    <span style={{ fontSize:12, color:RED, textAlign:'right' }}>{w.total_drops}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TRADES ── */}
          {segment === 'trades' && (
            <div style={{ padding:'10px 14px 24px' }}>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                <div style={{ flex:1, background:BG_CARD, borderRadius:8,
                  border:`0.5px solid ${GOLD_BORDER}`, padding:'10px 8px', textAlign:'center' }}>
                  <div style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.08em', marginBottom:4 }}>Total Trades</div>
                  <div style={{ fontSize:28, fontWeight:500, color:GOLD }}>{summary.total_trades||0}</div>
                </div>
              </div>
              <div style={{ background:BG_CARD, borderRadius:10, border:`0.5px solid ${GOLD_BORDER}`, overflow:'hidden' }}>
                <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 60px',
                  padding:'7px 12px', borderBottom:`0.5px solid ${GOLD_BORDER}` }}>
                  {['Week','','Trades'].map((h,i) => (
                    <span key={i} style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.08em',
                      textAlign:i>=2?'right':'left' }}>{h}</span>
                  ))}
                </div>
                {weeks.filter(w => w.total_trades > 0).map((w, i, arr) => (
                  <div key={w.week} onClick={() => w.trades?.length && setTradesModal({week:w.week, trades:w.trades})}
                    style={{ display:'grid', gridTemplateColumns:'60px 1fr 60px',
                      padding:'10px 12px', alignItems:'center', cursor:w.trades?.length?'pointer':'default',
                      borderBottom:i<arr.length-1?`0.5px solid rgba(212,168,67,0.06)`:'none' }}>
                    <span style={{ fontSize:12, color:TEXT_2 }}>
                      {w.week === 0 ? 'Pre' : `Wk ${w.week}`}
                    </span>
                    <div style={{ height:4, borderRadius:2, background:'rgba(212,168,67,0.1)',
                      overflow:'hidden', margin:'0 8px' }}>
                      <div style={{ height:'100%', borderRadius:2, background:GOLD_DIM,
                        width:`${Math.min((w.total_trades/5)*100,100)}%` }}/>
                    </div>
                    <span style={{ fontSize:12, color:GOLD, textAlign:'right' }}>{w.total_trades}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DRAFT ── */}
          {segment === 'draft' && (
            <div style={{ padding:'10px 14px 24px' }}>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                {[
                  { label:'Draft Type', value:(draft.draft_type||'—').toUpperCase() },
                  { label:'Total Picks', value:draft.total_picks||0 },
                ].map(t => (
                  <div key={t.label} style={{ flex:1, background:BG_CARD, borderRadius:8,
                    border:`0.5px solid ${GOLD_BORDER}`, padding:'10px 8px', textAlign:'center' }}>
                    <div style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.08em', marginBottom:4 }}>{t.label}</div>
                    <div style={{ fontSize:18, fontWeight:500, color:GOLD }}>{t.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:BG_CARD, borderRadius:10, border:`0.5px solid ${GOLD_BORDER}`, overflow:'hidden' }}>
                {/* Header */}
                <div style={{ display:'grid',
                  gridTemplateColumns:draft.draft_type==='auction'?'36px 36px 1fr 48px 44px':'36px 36px 1fr 48px',
                  padding:'7px 12px', borderBottom:`0.5px solid ${GOLD_BORDER}` }}>
                  {['#','',
                    'Player',
                    'Mgr',
                    ...(draft.draft_type==='auction'?['$']:[])
                  ].map((h,i) => (
                    <span key={i} style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.08em',
                      textAlign:i>=3?'right':'left' }}>{h}</span>
                  ))}
                </div>
                {(draft.picks||[]).map((p, i, arr) => (
                  <div key={p.overall_pick||i} style={{
                    display:'grid',
                    gridTemplateColumns:draft.draft_type==='auction'?'36px 36px 1fr 48px 44px':'36px 36px 1fr 48px',
                    padding:'8px 12px', alignItems:'center',
                    borderBottom:i<arr.length-1?`0.5px solid rgba(212,168,67,0.06)`:'none',
                    background:i%2===0?'transparent':'rgba(255,255,255,0.01)' }}>
                    <span style={{ fontSize:10, color:TEXT_3 }}>{p.overall_pick}</span>
                    <PosChip pos={p.position}/>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:12, color:TEXT_1, fontWeight:500,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {p.player_name}
                      </div>
                      <div style={{ fontSize:9, color:TEXT_3 }}>{p.nfl_team}</div>
                    </div>
                    <span style={{ fontSize:11, color:TEXT_2, textAlign:'right' }}>{p.display_name}</span>
                    {draft.draft_type==='auction' && (
                      <span style={{ fontSize:11, fontWeight:500, color:GOLD, textAlign:'right' }}>
                        ${p.cost}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}