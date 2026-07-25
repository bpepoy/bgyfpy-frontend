// src/screens/TeamsScreen.jsx
import { useState, useEffect } from 'react'
import SectionNav from '../components/shell/SectionNav'
import MatchupsTab from './MatchupsTab'
import Avatar from '../components/Avatar'

const API         = 'https://bgyfpy-backend.onrender.com'
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

const ACTIVE_MEMBERS = ['blake','brian','frank','jake','joey','jordan','kyle','nick','rob','zef']

const TX_ERA_OPTIONS = [
  { key:'all_time',    label:'All Time' },
  { key:'darkness',   label:'Raphi'    },
  { key:'sam_era',    label:'Sam'      },
  { key:'frank_era',  label:'Frank'    },
  { key:'jordan_era', label:'Jordan'   },
  { key:'auction_era',label:'Auction'  },
]

const INITIALS = {
  blake:'BJ', brian:'BP', frank:'FL', jake:'JK',
  joey:'JY', jordan:'JM', kyle:'KB', nick:'ND', rob:'RD', zef:'ZD'
}

const TABS = [
  { key:'overview',     label:'Overview',     icon:'/icons/overview-icon.png'      },
  { key:'results',      label:'Results',      icon:'/icons/results-icon.png'     },
  { key:'transactions', label:'Transactions', icon:'/icons/transactions-icon-2.png'},
  { key:'matchups',     label:'Matchups',     icon:'/icons/matchups-icon.png'      },
]

function SectionLabel({ label }) {
  return (
    <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.12em',
      textTransform:'uppercase', padding:'14px 14px 6px' }}>{label}</div>
  )
}

function Card({ children, style }) {
  return (
    <div style={{ background:BG_CARD, borderRadius:12,
      border:`0.5px solid ${GOLD_BORDER}`,
      margin:'0 14px 10px', overflow:'hidden', ...style }}>
      {children}
    </div>
  )
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────────────────
function OverviewTab({ data }) {
  if (!data) return null
  const managers = data.managers || []
  const active   = managers.filter(m => ACTIVE_MEMBERS.includes(m.manager_id))
                           .sort((a,b) => a.display_name.localeCompare(b.display_name))
  const former   = managers.filter(m => !ACTIVE_MEMBERS.includes(m.manager_id))
                           .sort((a,b) => a.display_name.localeCompare(b.display_name))

  const ManagerCard = ({ m }) => {
    const rsRecord = m.rs_ties
      ? `${m.rs_wins}–${m.rs_losses}–${m.rs_ties}`
      : `${m.rs_wins}–${m.rs_losses}`
    const poRecord = m.po_ties
      ? `${m.po_wins}–${m.po_losses}–${m.po_ties}`
      : `${m.po_wins}–${m.po_losses}`

    return (
      <div style={{ background:BG_CARD, borderRadius:12,
        border:`0.5px solid ${GOLD_BORDER}`,
        margin:'0 14px 10px', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
          borderBottom:`0.5px solid rgba(212,168,67,0.08)` }}>
          <Avatar managerId={m.manager_id} photoUrl={m.photo_url} size={44}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:16, fontWeight:500, color:TEXT_1 }}>{m.display_name}</div>
            <div style={{ fontSize:10, color:TEXT_2, marginTop:2 }}>{m.seasons} seasons</div>
          </div>
          <div style={{ textAlign:'right' }}>
            {m.championships > 0 && (
              <div style={{ fontSize:12, color:GOLD }}>{'🏆'.repeat(Math.min(m.championships, 4))}</div>
            )}
            {m.last_place > 0 && (
              <div style={{ fontSize:11, color:RED }}>{'💩'.repeat(Math.min(m.last_place, 3))}</div>
            )}
          </div>
        </div>
        {/* Stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', padding:'10px 14px', gap:8 }}>
          {[
            { label:'RS Record',    value:rsRecord },
            { label:'PO Record',    value:poRecord },
            { label:'Playoff Apps', value:m.playoff_apps },
            { label:'Championships',value:m.championships },
          ].map(s => (
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.08em', marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:12, fontWeight:500, color:GOLD }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom:24 }}>
      <SectionLabel label={`Active Members (${active.length})`}/>
      {active.map(m => <ManagerCard key={m.manager_id} m={m}/>)}
      {former.length > 0 && (
        <>
          <SectionLabel label={`Former Members (${former.length})`}/>
          {former.map(m => <ManagerCard key={m.manager_id} m={m}/>)}
        </>
      )}
    </div>
  )
}

// ── RESULTS TAB ───────────────────────────────────────────────────────────────
const ERA_OPTIONS = [
  { key:'all_time',    label:'All Time' },
  { key:'darkness',   label:'Raphi'    },
  { key:'sam_era',    label:'Sam'      },
  { key:'frank_era',  label:'Frank'    },
  { key:'jordan_era', label:'Jordan'   },
  { key:'auction_era',label:'Auction'  },
]

const RS_COLS = [
  { key:'wins',              label:'W',       fn:m=>m.regular_season?.wins??'—' },
  { key:'losses',            label:'L',       fn:m=>m.regular_season?.losses??'—' },
  { key:'avg_pf',            label:'PF/G',    fn:m=>m.regular_season?.avg_pf?.toFixed(1)??'—', gold:true },
  { key:'avg_pa',            label:'PA/G',    fn:m=>m.regular_season?.avg_pa?.toFixed(1)??'—' },
  { key:'avg_finish',        label:'Avg Fin', fn:m=>m.regular_season?.avg_finish?.toFixed(1)??'—' },
  { key:'avg_pf_rank',       label:'PF Rank', fn:m=>m.regular_season?.avg_pf_rank?.toFixed(1)??'—', gold:true },
  { key:'avg_pa_rank',       label:'PA Rank', fn:m=>m.regular_season?.avg_pa_rank?.toFixed(1)??'—' },
  { key:'proj_diff',         label:'Proj Δ',  fn:m=>m.regular_season?.proj_vs_actual_diff?.toFixed(1)??'—' },
]
const PO_COLS = [
  { key:'po_wins',           label:'W',       fn:m=>m.playoffs?.wins??'—' },
  { key:'po_losses',         label:'L',       fn:m=>m.playoffs?.losses??'—' },
  { key:'po_avg_pf',         label:'PF/G',    fn:m=>m.playoffs?.avg_pf?.toFixed(1)??'—', gold:true },
  { key:'po_avg_pa',         label:'PA/G',    fn:m=>m.playoffs?.avg_pa?.toFixed(1)??'—' },
  { key:'po_pf_rank',        label:'PF Rank', fn:m=>m.playoffs?.avg_pf_rank?.toFixed(1)??'—', gold:true },
  { key:'po_pa_rank',        label:'PA Rank', fn:m=>m.playoffs?.avg_pa_rank?.toFixed(1)??'—' },
]
const EXTRA_COLS = [
  { key:'wk_hi_total',       label:'Wk Hi',   fn:m=>m.weekly_high_total_wins??'—', gold:true },
  { key:'wk_hi_pos',         label:'Pos Hi',  fn:m=>m.weekly_high_pos_wins??'—' },
  { key:'ices',              label:'Ices',    fn:m=>m.ices_regular_season??'—' },
  { key:'winnings',          label:'$Won',    fn:m=>m.total_winnings?`$${m.total_winnings}`:'—', gold:true },
]
const RESULT_VIEWS = [
  { key:'rs',     label:'Reg Season', cols:RS_COLS },
  { key:'po',     label:'Playoffs',   cols:PO_COLS },
  { key:'extras', label:'Extras',     cols:EXTRA_COLS },
]

function ResultsTable({ rows, cols }) {
  if (!rows.length) return null
  const mgWidth = 90
  const colW    = Math.max(44, Math.floor((320 - mgWidth) / cols.length))
  const totalW  = mgWidth + colW * cols.length
  return (
    <div style={{ overflowX:'auto', margin:'0 14px 12px' }}>
      <div style={{ minWidth:totalW, background:BG_CARD, borderRadius:10,
        border:`0.5px solid ${GOLD_BORDER}`, overflow:'hidden' }}>
        {/* Col headers */}
        <div style={{ display:'grid', gridTemplateColumns:`${mgWidth}px repeat(${cols.length}, ${colW}px)`,
          padding:'6px 0', borderBottom:`0.5px solid ${GOLD_BORDER}`,
          background:'rgba(212,168,67,0.04)' }}>
          <span style={{ fontSize:8, color:TEXT_3, paddingLeft:10 }}>MANAGER</span>
          {cols.map(c => (
            <span key={c.key} style={{ fontSize:8, color:TEXT_3, textAlign:'center',
              letterSpacing:'0.06em' }}>{c.label}</span>
          ))}
        </div>
        {rows.map((m, i) => (
          <div key={m.manager_id} style={{ display:'grid',
            gridTemplateColumns:`${mgWidth}px repeat(${cols.length}, ${colW}px)`,
            padding:'8px 0', alignItems:'center',
            borderBottom:i<rows.length-1?`0.5px solid rgba(212,168,67,0.06)`:'none',
            background:i%2===0?'transparent':'rgba(255,255,255,0.015)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, paddingLeft:8 }}>
              <Avatar managerId={m.manager_id} size={20}/>
              <span style={{ fontSize:11, color:TEXT_1, fontWeight:500,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {m.display_name}
              </span>
            </div>
            {cols.map(c => (
              <span key={c.key} style={{ fontSize:11, textAlign:'center',
                color:c.gold?GOLD:TEXT_2 }}>{c.fn(m)}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ResultsTab() {
  const [era, setEra]       = useState('all_time')
  const [view, setView]     = useState('rs')
  const [eraData, setEraData] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (eraData[era]) return
    setLoading(true)
    fetch(`${API}/fantasy/teams/results?era=${era}`)
      .then(r => r.json())
      .then(d => { setEraData(prev => ({...prev, [era]:d})); setLoading(false) })
      .catch(() => setLoading(false))
  }, [era])

  const data    = eraData[era]
  const managers= data?.managers || []
  const active  = managers.filter(m => ACTIVE_MEMBERS.includes(m.manager_id))
                          .sort((a,b) => a.display_name.localeCompare(b.display_name))
  const former  = managers.filter(m => !ACTIVE_MEMBERS.includes(m.manager_id))
                          .sort((a,b) => a.display_name.localeCompare(b.display_name))
  const cols    = RESULT_VIEWS.find(v => v.key === view)?.cols || RS_COLS

  return (
    <div style={{ paddingBottom:24 }}>
      {/* Era pills */}
      <div style={{ display:'flex', gap:6, padding:'10px 14px 6px', overflowX:'auto' }}>
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
      {/* View toggle */}
      <div style={{ display:'flex', margin:'0 14px 6px', background:BG_CARD,
        borderRadius:10, border:`0.5px solid ${GOLD_BORDER}`, padding:3, gap:3 }}>
        {RESULT_VIEWS.map(v => (
          <button key={v.key} onClick={() => setView(v.key)}
            style={{ flex:1, padding:'6px 4px', borderRadius:8, border:'none', cursor:'pointer',
              background:view===v.key?GOLD_DIM:'transparent',
              borderWidth:view===v.key?1:0, borderStyle:'solid', borderColor:view===v.key?GOLD:'transparent',
              fontSize:9, letterSpacing:'0.06em', textTransform:'uppercase',
              color:view===v.key?GOLD:TEXT_3, fontWeight:view===v.key?600:400 }}>
            {v.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>Loading…</div>
      ) : (
        <>
          {active.length > 0 && <SectionLabel label="Active Members"/>}
          <ResultsTable rows={active} cols={cols}/>
          {former.length > 0 && <SectionLabel label="Former Members"/>}
          <ResultsTable rows={former} cols={cols}/>
        </>
      )}
    </div>
  )
}

// ── TRANSACTIONS TAB ──────────────────────────────────────────────────────────
function TxCard({ m }) {
  return (
    <div style={{ background:BG_CARD, borderRadius:12,
      border:`0.5px solid ${GOLD_BORDER}`,
      margin:'0 14px 10px', overflow:'hidden' }}>

      {/* Header: avatar + name + seasons | adds + drops + trades */}
      <div style={{ display:'flex', alignItems:'center', gap:10,
        padding:'10px 14px', borderBottom:`0.5px solid rgba(212,168,67,0.08)`,
        background:'rgba(212,168,67,0.03)' }}>
        <Avatar managerId={m.manager_id} size={36}/>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:500, color:TEXT_1 }}>{m.display_name}</div>
          <div style={{ fontSize:9, color:TEXT_3 }}>{m.seasons_tracked} seasons tracked</div>
        </div>
        <div style={{ display:'flex', gap:12, textAlign:'center' }}>
          {[
            { label:'Adds',   value:m.total_adds,   color:GREEN },
            { label:'Drops',  value:m.total_drops,  color:RED   },
            { label:'Trades', value:m.total_trades, color:GOLD  },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize:8, color:TEXT_3, marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:14, fontWeight:600, color:s.color }}>{s.value??'—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Second row: moves/season | trades/season | top trade partner */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr',
        padding:'8px 14px', borderBottom:`0.5px solid rgba(212,168,67,0.08)`, gap:4 }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:8, color:TEXT_3, marginBottom:2 }}>MOVES/SEASON</div>
          <div style={{ fontSize:13, fontWeight:500, color:TEXT_2 }}>
            {m.avg_moves_per_season??'—'}
          </div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:8, color:TEXT_3, marginBottom:2 }}>TRADES/SEASON</div>
          <div style={{ fontSize:13, fontWeight:500, color:TEXT_2 }}>
            {m.avg_trades_per_season??'—'}
          </div>
        </div>
        {m.top_trade_partner ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:8, color:TEXT_3, marginBottom:2 }}>TOP PARTNER</div>
            <div style={{ fontSize:12, fontWeight:500, color:TEXT_1 }}>
              {m.top_trade_partner.display_name}
            </div>
            <div style={{ fontSize:8, color:TEXT_3 }}>{m.top_trade_partner.trades} trades</div>
          </div>
        ) : <div/>}
      </div>

      {/* Highlights */}
      <div style={{ padding:'8px 14px' }}>
        <div style={{ fontSize:8, color:TEXT_3, letterSpacing:'0.08em', marginBottom:6 }}>
          HIGHLIGHTS
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {m.best_faab_bid && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:10, color:TEXT_2 }}>
                💰 Best FAAB — {m.best_faab_bid.player_name} ({m.best_faab_bid.year})
              </span>
              <span style={{ fontSize:11, fontWeight:500, color:GOLD }}>${m.best_faab_bid.bid}</span>
            </div>
          )}
          {m.best_auction_bid && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:10, color:TEXT_2 }}>
                🔨 Best Auction — {m.best_auction_bid.player_name} ({m.best_auction_bid.year})
              </span>
              <span style={{ fontSize:11, fontWeight:500, color:GOLD }}>${m.best_auction_bid.cost}</span>
            </div>
          )}
          {m.most_drafted_player && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:10, color:TEXT_2 }}>
                📋 Most Drafted — {m.most_drafted_player.player_name}
              </span>
              <span style={{ fontSize:11, fontWeight:500, color:GOLD }}>
                {m.most_drafted_player.count}×
              </span>
            </div>
          )}
          {m.avg_faab_remaining != null && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:10, color:TEXT_2 }}>
                💵 Avg FAAB Remaining ({m.faab_seasons_tracked} seasons)
              </span>
              <span style={{ fontSize:11, fontWeight:500,
                color:m.avg_faab_remaining >= 0 ? GREEN : RED }}>
                ${m.avg_faab_remaining?.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TeamTransactionsTab() {
  const [era, setEra]       = useState('all_time')
  const [eraData, setEraData] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (eraData[era]) return
    setLoading(true)
    fetch(`${API}/fantasy/teams/transactions?era=${era}`)
      .then(r => r.json())
      .then(d => { setEraData(prev => ({...prev, [era]:d})); setLoading(false) })
      .catch(() => setLoading(false))
  }, [era])

  const data    = eraData[era]
  const managers= data?.managers || []
  const active  = managers.filter(m => ACTIVE_MEMBERS.includes(m.manager_id))
                          .sort((a,b) => a.display_name.localeCompare(b.display_name))
  const former  = managers.filter(m => !ACTIVE_MEMBERS.includes(m.manager_id))
                          .sort((a,b) => a.display_name.localeCompare(b.display_name))

  return (
    <div style={{ paddingBottom:24 }}>
      {/* Era pills */}
      <div style={{ display:'flex', gap:6, padding:'10px 14px 8px', overflowX:'auto' }}>
        {TX_ERA_OPTIONS.map(e => (
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
        <>
          <SectionLabel label={`Active Members (${active.length})`}/>
          {active.map(m => <TxCard key={m.manager_id} m={m}/>)}
          {former.length > 0 && (
            <>
              <SectionLabel label={`Former Members (${former.length})`}/>
              {former.map(m => <TxCard key={m.manager_id} m={m}/>)}
            </>
          )}
        </>
      )}
    </div>
  )
}

// MatchupsTab imported from ./MatchupsTab

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function TeamsScreen() {
  const [activeTab, setActiveTab]         = useState('overview')
  const [overviewData, setOverviewData]   = useState(null)
  const [txData, setTxData]               = useState(null)
  const [matchupsData, setMatchupsData]   = useState(null)
  const [loading, setLoading]             = useState({})

  const fetchTab = async (tab) => {
    if (loading[tab]) return
    setLoading(prev => ({...prev, [tab]:true}))
    const endpoints = {
      overview:     '/fantasy/teams/overview',
      transactions: '/fantasy/teams/transactions',
      matchups:     '/fantasy/teams/matchups',
    }
    try {
      const res  = await fetch(`${API}${endpoints[tab]}`)
      const data = await res.json()
      const setters = {
        overview:     setOverviewData,
        transactions: setTxData,
        matchups:     setMatchupsData,
      }
      setters[tab]?.(data)
    } catch(e) { console.error(e) }
    finally { setLoading(prev => ({...prev, [tab]:false})) }
  }

  useEffect(() => { fetchTab('overview') }, [])
  useEffect(() => {
    if (activeTab === 'transactions' && !txData)       fetchTab('transactions')
  }, [activeTab])

  const isLoading = loading[activeTab]

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:16 }}>
      <SectionNav tabs={TABS} activeKey={activeTab} onSelect={setActiveTab}/>
      {isLoading ? (
        <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>Loading…</div>
      ) : (
        <>
          {activeTab === 'overview'     && <OverviewTab        data={overviewData}/>}
          {activeTab === 'results'      && <ResultsTab/>}
          {activeTab === 'transactions' && <TeamTransactionsTab/>}
          {activeTab === 'matchups'     && <MatchupsTab data={matchupsData}/>}
        </>
      )}
    </div>
  )
}