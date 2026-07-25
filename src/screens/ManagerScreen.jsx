// src/screens/ManagerScreen.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import SectionNav from '../components/shell/SectionNav'
import Avatar from '../components/Avatar'

const API         = 'https://bgyfpy-backend.onrender.com'
const GOLD        = '#D4A843'
const GOLD_DIM    = 'rgba(212,168,67,0.15)'
const GOLD_BORDER = 'rgba(212,168,67,0.3)'
const BG_CARD     = '#1e1e1e'
const TEXT_1      = '#F0E6CC'
const TEXT_2      = '#A89060'
const TEXT_3      = '#967843'
const GREEN       = '#5DBF6A'
const RED         = '#CF5F5F'

const INITIALS = {
  blake:'BJ',brian:'BP',frank:'FL',jake:'JK',joey:'JY',
  jordan:'JM',kyle:'KB',nick:'ND',rob:'RD',zef:'ZD'
}
const POS_COLORS = {
  QB:'#E07B54',WR:'#5B9BD5',RB:'#5DBF6A',TE:'#D4A843',
  DEF:'#888',K:'#A87DC8','W/R/T':'#C8A050'
}
const POS_ORDER = ['QB','WR','RB','TE','W/R/T','W/R','K','DEF','BN','IR']

const ERA_OPTIONS = [
  {key:'all_time',label:'All Time'},
  {key:'darkness',label:'Raphi'},
  {key:'sam_era',label:'Sam'},
  {key:'frank_era',label:'Frank'},
  {key:'jordan_era',label:'Jordan'},
  {key:'auction_era',label:'Auction'},
]

const TABS = [
  {key:'overview',     label:'Overview',     icon:'/icons/overview-icon.png'},
  {key:'results',      label:'Results',      icon:'/icons/results-icon.png'},
  {key:'transactions', label:'Transactions', icon:'/icons/transactions-icon-2.png'},
  {key:'matchups',     label:'Matchups',     icon:'/icons/matchups-icon.png'},
]

function StatRow({label,value,sub,last,accent}) {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'9px 14px',
      borderBottom:last?'none':'0.5px solid rgba(212,168,67,0.08)'}}>
      <div>
        <div style={{fontSize:12,color:TEXT_2}}>{label}</div>
        {sub&&<div style={{fontSize:9,color:TEXT_3,marginTop:1}}>{sub}</div>}
      </div>
      <div style={{fontSize:13,fontWeight:500,color:accent||TEXT_1}}>{value}</div>
    </div>
  )
}

function Card({children,style}) {
  return (
    <div style={{background:BG_CARD,borderRadius:12,
      border:`0.5px solid ${GOLD_BORDER}`,
      margin:'0 14px 10px',overflow:'hidden',...style}}>
      {children}
    </div>
  )
}

function SectionLabel({label}) {
  return (
    <div style={{fontSize:9,color:TEXT_3,letterSpacing:'0.12em',
      textTransform:'uppercase',padding:'14px 14px 6px'}}>{label}</div>
  )
}

function EraToggle({value,onChange}) {
  return (
    <div style={{display:'flex',gap:6,padding:'10px 14px 4px',overflowX:'auto'}}>
      {ERA_OPTIONS.map(e=>(
        <button key={e.key} onClick={()=>onChange(e.key)}
          style={{padding:'5px 10px',borderRadius:14,border:'none',cursor:'pointer',
            background:value===e.key?GOLD_DIM:'rgba(255,255,255,0.04)',
            borderWidth:value===e.key?1:0.5,borderStyle:'solid',
            borderColor:value===e.key?GOLD:'rgba(255,255,255,0.06)',
            fontSize:9,color:value===e.key?GOLD:TEXT_3,
            fontWeight:value===e.key?600:400,flexShrink:0,whiteSpace:'nowrap'}}>
          {e.label}
        </button>
      ))}
    </div>
  )
}

function ViewToggle({value,onChange}) {
  return (
    <div style={{display:'flex',margin:'10px 14px 0',background:BG_CARD,
      borderRadius:10,border:`0.5px solid ${GOLD_BORDER}`,padding:3,gap:3}}>
      {[{k:'era',l:'By Era'},{k:'season',l:'By Season'}].map(o=>(
        <button key={o.k} onClick={()=>onChange(o.k)}
          style={{flex:1,padding:'7px',borderRadius:8,border:'none',cursor:'pointer',
            background:value===o.k?GOLD_DIM:'transparent',
            borderWidth:value===o.k?1:0,borderStyle:'solid',
            borderColor:value===o.k?GOLD:'transparent',
            fontSize:10,color:value===o.k?GOLD:TEXT_3,
            fontWeight:value===o.k?600:400,textTransform:'uppercase',
            letterSpacing:'0.06em'}}>
          {o.l}
        </button>
      ))}
    </div>
  )
}

function SeasonPicker({seasons,current,onChange}) {
  const [open,setOpen] = useState(false)
  const idx = seasons.indexOf(current)
  const hasPrev = idx < seasons.length-1
  const hasNext = idx > 0
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',
      gap:10,padding:'4px 14px 8px'}}>
      <button onClick={()=>hasPrev&&onChange(seasons[idx+1])} disabled={!hasPrev}
        style={{width:28,height:28,borderRadius:'50%',
          border:`0.5px solid ${hasPrev?GOLD_BORDER:'rgba(255,255,255,0.06)'}`,
          background:BG_CARD,cursor:hasPrev?'pointer':'default',
          display:'flex',alignItems:'center',justifyContent:'center',
          color:hasPrev?GOLD:TEXT_3,fontSize:14}}>‹</button>
      <div style={{position:'relative'}}>
        <button onClick={()=>setOpen(p=>!p)}
          style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',
            borderRadius:18,border:`1px solid ${GOLD_BORDER}`,
            background:GOLD_DIM,cursor:'pointer',fontSize:12,fontWeight:500,color:GOLD}}>
          {current} <span style={{fontSize:9,color:TEXT_2}}>▼</span>
        </button>
        {open&&(
          <div style={{position:'absolute',top:'110%',left:'50%',
            transform:'translateX(-50%)',background:'#1a1a1a',
            border:`0.5px solid ${GOLD_BORDER}`,borderRadius:10,zIndex:20,
            minWidth:120,maxHeight:240,overflowY:'auto',
            boxShadow:'0 8px 24px rgba(0,0,0,0.6)'}}>
            {seasons.map(yr=>(
              <div key={yr} onClick={()=>{onChange(yr);setOpen(false)}}
                style={{padding:'9px 14px',cursor:'pointer',fontSize:12,
                  color:yr===current?GOLD:TEXT_2,
                  background:yr===current?GOLD_DIM:'transparent',
                  borderBottom:`0.5px solid rgba(212,168,67,0.08)`}}>{yr}</div>
            ))}
          </div>
        )}
      </div>
      <button onClick={()=>hasNext&&onChange(seasons[idx-1])} disabled={!hasNext}
        style={{width:28,height:28,borderRadius:'50%',
          border:`0.5px solid ${hasNext?GOLD_BORDER:'rgba(255,255,255,0.06)'}`,
          background:BG_CARD,cursor:hasNext?'pointer':'default',
          display:'flex',alignItems:'center',justifyContent:'center',
          color:hasNext?GOLD:TEXT_3,fontSize:14}}>›</button>
    </div>
  )
}

function PosChip({pos}) {
  const c = POS_COLORS[pos]||TEXT_3
  return (
    <span style={{fontSize:8,fontWeight:700,color:c,background:`${c}22`,
      border:`1px solid ${c}44`,borderRadius:4,padding:'2px 6px',
      flexShrink:0,minWidth:28,textAlign:'center',display:'inline-block'}}>{pos}</span>
  )
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function OverviewTab({name}) {
  const [data,setData] = useState(null)
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    fetch(`${API}/fantasy/${name}/overview`)
      .then(r=>r.json()).then(d=>{setData(d);setLoading(false)})
      .catch(()=>setLoading(false))
  },[name])

  if (loading) return <div style={{padding:40,textAlign:'center',color:TEXT_3,fontSize:12}}>Loading…</div>
  if (!data) return null

  const rs = data.regular_season||{}
  const po = data.playoffs||{}
  const ac = data.accolades||{}
  const fmtRecord = (w,l,t) => t?`${w}–${l}–${t}`:`${w}–${l}`

  return (
    <div style={{paddingBottom:24}}>
      {/* Hero */}
      <div style={{display:'flex',alignItems:'center',gap:16,padding:'20px 16px 16px'}}>
        <Avatar managerId={name} photoUrl={data.photo_url} size={64}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:20,fontWeight:500,color:TEXT_1}}>{data.display_name}</div>
          <div style={{fontSize:11,color:TEXT_2,marginTop:3}}>{data.team_name}</div>
          <div style={{fontSize:10,color:TEXT_3,marginTop:2}}>{data.seasons_played} seasons played</div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          {ac.championships>0&&<div style={{fontSize:16}}>{'🏆'.repeat(Math.min(ac.championships,4))}</div>}
          {ac.last_places>0&&<div style={{fontSize:13,marginTop:2}}>{'💩'.repeat(Math.min(ac.last_places,3))}</div>}
        </div>
      </div>

      <SectionLabel label="Accolades"/>
      <Card>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',padding:'12px 14px',gap:8}}>
          {[
            {label:'Championships',value:ac.championships||0,color:GOLD,sub:ac.championship_years?.join(', ')},
            {label:'Playoff Apps',value:ac.playoff_appearances||0,color:TEXT_1},
            {label:'Last Place',value:ac.last_places||0,color:RED,sub:ac.last_place_years?.join(', ')},
          ].map(s=>(
            <div key={s.label} style={{textAlign:'center'}}>
              <div style={{fontSize:8,color:TEXT_3,letterSpacing:'0.08em',marginBottom:3}}>{s.label}</div>
              <div style={{fontSize:18,fontWeight:600,color:s.color}}>{s.value}</div>
              {s.sub&&<div style={{fontSize:8,color:TEXT_3,marginTop:2}}>{s.sub}</div>}
            </div>
          ))}
        </div>
      </Card>

      <SectionLabel label="Regular Season"/>
      <Card>
        <StatRow label="Record" value={fmtRecord(rs.wins,rs.losses,rs.ties)}
          accent={rs.win_pct>=0.5?GREEN:RED}/>
        <StatRow label="Win %" value={`${((rs.win_pct||0)*100).toFixed(1)}%`}
          sub={rs.wins_rank} accent={rs.win_pct>=0.5?GREEN:RED}/>
        <StatRow label="Avg PF" value={rs.avg_pf?.toFixed(1)||'—'}
          sub={rs.avg_pf_rank} accent={GOLD}/>
        <StatRow label="Avg PA" value={rs.avg_pa?.toFixed(1)||'—'}/>
        <StatRow label="Games Played" value={rs.games||'—'} last/>
      </Card>

      <SectionLabel label="Playoffs"/>
      <Card>
        <StatRow label="Record" value={fmtRecord(po.wins,po.losses,po.ties)}
          accent={po.win_pct>=0.5?GREEN:RED}/>
        <StatRow label="Win %" value={po.win_pct!=null?`${(po.win_pct*100).toFixed(1)}%`:'—'}/>
        <StatRow label="Avg PF" value={po.avg_pf?.toFixed(1)||'—'}
          sub={po.avg_pf_rank} accent={GOLD}/>
        <StatRow label="Appearances" value={po.appearances||ac.playoff_appearances||'—'} last/>
      </Card>
    </div>
  )
}

// ── RESULTS ───────────────────────────────────────────────────────────────────
function ResultsTab({name}) {
  const [view,setView]       = useState('era')
  const [era,setEra]         = useState('all_time')
  const [season,setSeason]   = useState(null)
  const [seasons,setSeasons] = useState([])
  const [eraData,setEraData] = useState({})
  const [yrData,setYrData]   = useState({})
  const [loading,setLoading] = useState(false)

  // Load available seasons once from overview
  useEffect(()=>{
    fetch(`${API}/fantasy/${name}/overview`)
      .then(r=>r.json())
      .then(d=>{
        // Build years list from seasons_played
        const latest = new Date().getFullYear()
        const played = d.seasons_played || 10
        const yrs = Array.from({length:played},(_,i)=>latest-i).filter(y=>y>=2007)
        if (yrs.length&&!seasons.length){setSeasons(yrs);setSeason(yrs[0])}
      }).catch(()=>{})
  },[name])

  useEffect(()=>{
    if (eraData[era]) return
    setLoading(true)
    fetch(`${API}/fantasy/${name}/results?era=${era}`)
      .then(r=>r.json())
      .then(d=>{
        setEraData(prev=>({...prev,[era]:d}))
        // Also try to get seasons from era_breakdown keys
        if (d.era_breakdown&&!seasons.length) {
          // era_breakdown has keys for each era, not years — skip
        }
        setLoading(false)
      }).catch(()=>setLoading(false))
  },[era,name])

  useEffect(()=>{
    if (!season||yrData[season]) return
    fetch(`${API}/fantasy/${name}/results/${season}`)
      .then(r=>r.json())
      .then(d=>setYrData(prev=>({...prev,[season]:d})))
      .catch(()=>{})
  },[season,name])

  const d    = view==='era' ? eraData[era] : yrData[season]
  const rec  = d?.record   || {}
  const pts  = d?.points   || {}
  const plrs = d?.players  || {}
  const add  = d?.additional || {}
  const rsRec = rec?.regular_season || {}
  const poRec = rec?.playoffs       || {}
  const rsPts = pts?.regular_season || {}
  const poPts = pts?.playoffs       || {}

  // Normalize rank fields — era uses wins_rank/avg_pf_rank, year uses rank/pf_rank
  const rsWinsRank = rsRec.wins_rank || (rsRec.rank ? `${rsRec.rank} of ${rsRec.rank_of||10}` : null)
  const rsPfRank   = rsPts.avg_pf_rank || (rsPts.pf_rank ? `${rsPts.pf_rank} of ${rsPts.rank_of||10}` : null)
  const rsPaRank   = rsPts.avg_pa_rank || (rsPts.pa_rank ? `${rsPts.pa_rank} of ${rsPts.rank_of||10}` : null)
  const poPfRank   = poPts.avg_pf_rank || (poPts.pf_rank ? `${poPts.pf_rank} of ${poPts.rank_of||10}` : null)

  return (
    <div style={{paddingBottom:24}}>
      <ViewToggle value={view} onChange={setView}/>
      {view==='era'
        ? <EraToggle value={era} onChange={setEra}/>
        : seasons.length>0&&season&&<SeasonPicker seasons={seasons} current={season} onChange={setSeason}/>
      }
      {loading ? (
        <div style={{padding:40,textAlign:'center',color:TEXT_3,fontSize:12}}>Loading…</div>
      ) : !d ? null : (
        <>
          <SectionLabel label="Regular Season Record"/>
          <Card>
            <StatRow label="Record"
              value={rsRec.wins!=null?`${rsRec.wins}–${rsRec.losses}${rsRec.ties?`–${rsRec.ties}`:''}` :'—'}
              accent={rsRec.win_pct>=0.5?GREEN:RED}/>
            <StatRow label="Win %" value={rsRec.win_pct!=null?`${(rsRec.win_pct*100).toFixed(1)}%`:'—'}
              sub={rsWinsRank}/>
            <StatRow label="Avg Finish" value={rsRec.avg_finish?.toFixed(1)||'—'}/>
            {rsRec.best_season&&(
              <StatRow label="Best Season"
                value={`${rsRec.best_season.wins}–${rsRec.best_season.losses}`}
                sub={`${rsRec.best_season.year} · Rank ${rsRec.best_season.rank}`} accent={GREEN}/>
            )}
            {rsRec.worst_season&&(
              <StatRow label="Worst Season"
                value={`${rsRec.worst_season.wins}–${rsRec.worst_season.losses}`}
                sub={`${rsRec.worst_season.year} · Rank ${rsRec.worst_season.rank}`} accent={RED} last/>
            )}
          </Card>

          <SectionLabel label="Regular Season Points"/>
          <Card>
            <StatRow label="Avg PF / Game" value={rsPts.avg_pf?.toFixed(1)||'—'}
              sub={rsPfRank} accent={GOLD}/>
            <StatRow label="Avg PA / Game" value={rsPts.avg_pa?.toFixed(1)||'—'}
              sub={rsPaRank}/>
            <StatRow label="Avg Projected" value={rsPts.avg_proj_pf?.toFixed(1)||'—'}/>
            <StatRow label="Actual vs Proj"
              value={rsPts.actual_vs_proj!=null
                ?`${rsPts.actual_vs_proj>0?'+':''}${rsPts.actual_vs_proj.toFixed(2)}`:'—'}
              accent={rsPts.actual_vs_proj>=0?GREEN:RED}/>
            {rsPts.best_week&&(
              <StatRow label="Best Week" value={`${rsPts.best_week.points} pts`}
                sub={`${rsPts.best_week.year} Wk ${rsPts.best_week.week}`} accent={GREEN}/>
            )}
            {rsPts.worst_week&&(
              <StatRow label="Worst Week" value={`${rsPts.worst_week.points} pts`}
                sub={`${rsPts.worst_week.year} Wk ${rsPts.worst_week.week}`} accent={RED}/>
            )}
            {rsPts.best_season_avg&&(
              <StatRow label="Best Season Avg"
                value={`${rsPts.best_season_avg.avg_pf} pts/g`}
                sub={String(rsPts.best_season_avg.year)} accent={GREEN}/>
            )}
            {rsPts.worst_season_avg&&(
              <StatRow label="Worst Season Avg"
                value={`${rsPts.worst_season_avg.avg_pf} pts/g`}
                sub={String(rsPts.worst_season_avg.year)} accent={RED} last/>
            )}
          </Card>

          <SectionLabel label="Playoffs"/>
          <Card>
            <StatRow label="Record"
              value={poRec.wins!=null?`${poRec.wins}–${poRec.losses}`:'—'}/>
            <StatRow label="Appearances" value={poRec.appearances||'—'}/>
            <StatRow label="Avg PF / Game" value={poPts.avg_pf?.toFixed(1)||'—'}
              sub={poPfRank} accent={GOLD}/>
            <StatRow label="Avg PA / Game" value={poPts.avg_pa?.toFixed(1)||'—'}/>
            <StatRow label="Actual vs Proj"
              value={poPts.actual_vs_proj!=null
                ?`${poPts.actual_vs_proj>0?'+':''}${poPts.actual_vs_proj.toFixed(2)}`:'—'}
              accent={poPts.actual_vs_proj>=0?GREEN:RED}/>
            {poPts.best_week&&(
              <StatRow label="Best Playoff Week" value={`${poPts.best_week.points} pts`}
                sub={`${poPts.best_week.year} Wk ${poPts.best_week.week}`} accent={GREEN}/>
            )}
            {poPts.worst_week&&(
              <StatRow label="Worst Playoff Week" value={`${poPts.worst_week.points} pts`}
                sub={`${poPts.worst_week.year} Wk ${poPts.worst_week.week}`} accent={RED} last/>
            )}
          </Card>

          {plrs.best_position_week&&Object.keys(plrs.best_position_week).length>0&&(
            <>
              <SectionLabel label="Best Week by Position"/>
              <Card>
                {Object.entries(plrs.best_position_week).filter(([,d])=>d).map(([pos,data],i,arr)=>(
                  <div key={pos} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',
                    borderBottom:i<arr.length-1?'0.5px solid rgba(212,168,67,0.08)':'none'}}>
                    <PosChip pos={pos}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,color:TEXT_1,fontWeight:500}}>{data.player_name}</div>
                      <div style={{fontSize:9,color:TEXT_3}}>{data.year} Wk {data.week}</div>
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:GREEN}}>{data.points}</div>
                  </div>
                ))}
              </Card>
            </>
          )}
          {plrs.worst_position_week_nonzero&&Object.keys(plrs.worst_position_week_nonzero).length>0&&(
            <>
              <SectionLabel label="Worst Week by Position"/>
              <Card>
                {Object.entries(plrs.worst_position_week_nonzero).filter(([,d])=>d).map(([pos,data],i,arr)=>(
                  <div key={pos} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',
                    borderBottom:i<arr.length-1?'0.5px solid rgba(212,168,67,0.08)':'none'}}>
                    <PosChip pos={pos}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,color:TEXT_1,fontWeight:500}}>{data.player_name}</div>
                      <div style={{fontSize:9,color:TEXT_3}}>{data.year} Wk {data.week}</div>
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:RED}}>{data.points}</div>
                  </div>
                ))}
              </Card>
            </>
          )}

          {plrs.most_weeks_as_starter?.length>0&&(
            <>
              <SectionLabel label="Most Weeks as Starter"/>
              <Card>
                {plrs.most_weeks_as_starter.slice(0,5).map((p,i,arr)=>(
                  <div key={p.player_name} style={{display:'flex',alignItems:'center',
                    justifyContent:'space-between',padding:'9px 14px',
                    borderBottom:i<arr.length-1?'0.5px solid rgba(212,168,67,0.08)':'none'}}>
                    <div>
                      <div style={{fontSize:12,color:TEXT_1,fontWeight:500}}>{p.player_name}</div>
                      <div style={{fontSize:9,color:TEXT_3}}>
                        {p.pct_of_season ? `${p.pct_of_season}% of season` : p.approx_seasons ? `${p.approx_seasons} seasons` : ''}
                      </div>
                    </div>
                    <div style={{fontSize:13,fontWeight:500,color:GOLD}}>
                      {p.weeks_as_starter??p.weeks_on_team??'—'} wks
                    </div>
                  </div>
                ))}
              </Card>
            </>
          )}

          {add&&Object.keys(add).length>0&&(
            <>
              <SectionLabel label="Additional"/>
              <Card>
                {add.total_winnings!=null&&(
                  <StatRow label="Total Winnings" value={`$${add.total_winnings}`} accent={GOLD}/>
                )}
                {add.weeks_high_total_points!=null&&(
                  <StatRow label="Weekly High Score Wins" value={add.weeks_high_total_points}/>
                )}
                {add.weeks_high_position_points!=null&&(
                  <StatRow label="Position High Score Wins" value={add.weeks_high_position_points}/>
                )}
                {add.weeks_vs_high_scorer!=null&&(
                  <StatRow label="Weeks vs High Scorer" value={add.weeks_vs_high_scorer}/>
                )}
                {add.total_ices_real!=null&&(
                  <StatRow label="Real Ices" value={add.total_ices_real}
                    sub={add.ices_note} last/>
                )}
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── TRANSACTIONS ──────────────────────────────────────────────────────────────
function TransactionsTab({name}) {
  const [view,setView]         = useState('era')
  const [era,setEra]           = useState('all_time')
  const [season,setSeason]     = useState(null)
  const [seasons,setSeasons]   = useState([])
  const [eraData,setEraData]   = useState({})
  const [yrData,setYrData]     = useState({})
  const [loading,setLoading]   = useState(false)
  const [movesModal,setMovesModal]   = useState(null)
  const [tradesModal,setTradesModal] = useState(null)

  // Load seasons list from overview
  useEffect(()=>{
    fetch(`${API}/fantasy/${name}/overview`)
      .then(r=>r.json())
      .then(d=>{
        const latest = new Date().getFullYear()
        const played = d.seasons_played || 10
        const yrs = Array.from({length:played},(_,i)=>latest-i).filter(y=>y>=2007)
        if (yrs.length&&!seasons.length){setSeasons(yrs);setSeason(yrs[0])}
      }).catch(()=>{})
  },[name])

  useEffect(()=>{
    if (eraData[era]) return
    setLoading(true)
    fetch(`${API}/fantasy/${name}/transactions?era=${era}`)
      .then(r=>r.json())
      .then(d=>{
        setEraData(prev=>({...prev,[era]:d}))
        setLoading(false)
      }).catch(()=>setLoading(false))
  },[era,name])

  useEffect(()=>{
    if (!season||yrData[season]) return
    fetch(`${API}/fantasy/${name}/transactions/${season}`)
      .then(r=>r.json())
      .then(d=>setYrData(prev=>({...prev,[season]:d})))
      .catch(()=>{})
  },[season,name])

  const d      = view==='era' ? eraData[era] : yrData[season]
  const moves  = d?.moves  || {}
  const trades = d?.trades || {}
  const draft  = d?.draft  || {}

  // Year endpoint nests adds/drops inside moves{}, trades inside trades{}
  const allAdds   = moves.all_adds   || d?.all_adds   || []
  const allDrops  = moves.all_drops  || d?.all_drops  || []
  const allTrades = trades.all_trades|| d?.all_trades || []
  const isYearView = view==='season' && season

  return (
    <div style={{paddingBottom:24}}>
      {/* Moves modal */}
      {movesModal&&(
        <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.95)',
          display:'flex',flexDirection:'column',overflowY:'auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'14px 16px',background:'#171717',borderBottom:`0.5px solid ${GOLD_BORDER}`,
            position:'sticky',top:0,zIndex:10,flexShrink:0}}>
            <div style={{fontSize:11,color:TEXT_2}}>
              {movesModal.label} · {movesModal.moves.length} moves
            </div>
            <button onClick={()=>setMovesModal(null)} style={{background:'none',border:'none',
              color:TEXT_2,fontSize:22,cursor:'pointer'}}>✕</button>
          </div>
          <div style={{padding:'8px 0 24px'}}>
            {movesModal.moves.map((m,i)=>{
              const isAdd=m.type==='add'||(m.source_type&&!m.type)
              return (
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 16px',
                  borderBottom:'0.5px solid rgba(212,168,67,0.06)',
                  background:isAdd?'rgba(93,191,106,0.04)':'rgba(207,95,95,0.04)'}}>
                  <div style={{width:28,height:28,borderRadius:6,flexShrink:0,
                    background:isAdd?'rgba(93,191,106,0.15)':'rgba(207,95,95,0.15)',
                    border:`1px solid ${isAdd?'rgba(93,191,106,0.3)':'rgba(207,95,95,0.3)'}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:11,fontWeight:700,color:isAdd?GREEN:RED}}>
                    {isAdd?'+':'–'}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:12,fontWeight:500,color:TEXT_1}}>{m.player_name}</span>
                      <PosChip pos={m.position}/>
                      <span style={{fontSize:9,color:TEXT_3}}>{m.nfl_team}</span>
                    </div>
                    {m.waiver_bid!=null&&<div style={{fontSize:9,color:GOLD,marginTop:2}}>FAAB ${m.waiver_bid}</div>}
                    {m.source_type&&<div style={{fontSize:9,color:TEXT_3,marginTop:1}}>{m.source_type}</div>}
                  </div>
                  <div style={{fontSize:9,color:TEXT_3,flexShrink:0}}>{m.date}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Trades modal */}
      {tradesModal&&(
        <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.95)',
          display:'flex',flexDirection:'column',overflowY:'auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'14px 16px',background:'#171717',borderBottom:`0.5px solid ${GOLD_BORDER}`,
            position:'sticky',top:0,zIndex:10,flexShrink:0}}>
            <div style={{fontSize:11,color:TEXT_2}}>{tradesModal.label}</div>
            <button onClick={()=>setTradesModal(null)} style={{background:'none',border:'none',
              color:TEXT_2,fontSize:22,cursor:'pointer'}}>✕</button>
          </div>
          <div style={{padding:'8px 16px 24px'}}>
            {tradesModal.trades.map((t,i)=>{
              // Year endpoint uses i_received/i_sent; era uses a_received/b_received
              const myReceived  = t.i_received || t.a_received || t.trader_receives || []
              const oppReceived = t.i_sent     || t.b_received || t.tradee_receives || []
              const oppName     = t.partner_display_name || t.manager_b?.display_name || t.tradee_manager || 'Opponent'
              const oppId       = t.partner_manager_id  || t.manager_b?.manager_id
              return (
                <div key={i} style={{background:BG_CARD,borderRadius:10,
                  border:`0.5px solid ${GOLD_BORDER}`,marginBottom:10,overflow:'hidden'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                    padding:'8px 12px',borderBottom:'0.5px solid rgba(212,168,67,0.1)',
                    background:'rgba(212,168,67,0.04)'}}>
                    <span style={{fontSize:11,fontWeight:500,color:GOLD}}>Me</span>
                    <span style={{fontSize:10,color:TEXT_3}}>⇄</span>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      {oppId&&<Avatar managerId={oppId} size={20}/>}
                      <span style={{fontSize:11,fontWeight:500,color:TEXT_1}}>{oppName}</span>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
                    {[
                      {label:'I Receive', players:myReceived},
                      {label:'I Send',    players:oppReceived},
                    ].map((side,si)=>(
                      <div key={si} style={{padding:'8px 10px',
                        borderRight:si===0?'0.5px solid rgba(212,168,67,0.1)':'none'}}>
                        <div style={{fontSize:8,color:TEXT_3,marginBottom:4}}>{side.label}</div>
                        {side.players.map((p,j)=>(
                          <div key={j} style={{marginBottom:4}}>
                            <div style={{display:'flex',alignItems:'center',gap:4}}>
                              <PosChip pos={p.position}/>
                              <span style={{fontSize:10,color:TEXT_1}}>{p.name||p.player_name}</span>
                            </div>
                            <div style={{fontSize:8,color:TEXT_3,paddingLeft:4}}>{p.nfl_team}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div style={{padding:'4px 12px 6px',fontSize:9,color:TEXT_3}}>
                    {t.week?`Week ${t.week} · `:''}{t.date}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <ViewToggle value={view} onChange={setView}/>
      {view==='era'
        ? <EraToggle value={era} onChange={setEra}/>
        : seasons.length>0&&season&&<SeasonPicker seasons={seasons} current={season} onChange={setSeason}/>
      }

      {loading ? (
        <div style={{padding:40,textAlign:'center',color:TEXT_3,fontSize:12}}>Loading…</div>
      ) : !d ? null : (
        <>
          {/* Summary tiles */}
          <div style={{display:'flex',gap:6,padding:'8px 14px'}}>
            {[
              {l:'Moves', v:moves.total_moves,  c:TEXT_1},
              {l:'Adds',  v:moves.total_adds,   c:GREEN},
              {l:'Drops', v:moves.total_drops,  c:RED},
              {l:'Trades',v:trades.total_trades,c:GOLD},
            ].map(s=>(
              <div key={s.l} style={{flex:1,background:BG_CARD,borderRadius:8,
                border:`0.5px solid ${GOLD_BORDER}`,padding:'8px 4px',textAlign:'center'}}>
                <div style={{fontSize:8,color:TEXT_3,marginBottom:2}}>{s.l}</div>
                <div style={{fontSize:16,fontWeight:600,color:s.c}}>{s.v??'—'}</div>
              </div>
            ))}
          </div>

          {/* Moves highlights (era view) */}
          {!isYearView&&(
            <>
              <SectionLabel label="Move Highlights"/>
              <Card>
                <StatRow label="Avg Moves / Season" value={moves.avg_moves_per_season??'—'}/>
                {moves.best_faab_add&&(
                  <StatRow label="Best FAAB Add"
                    value={`$${moves.best_faab_add.bid}`}
                    sub={`${moves.best_faab_add.player_name} (${moves.best_faab_add.position}) · ${moves.best_faab_add.year}`}
                    accent={GOLD}/>
                )}
                {moves.avg_faab_remaining!=null&&(
                  <StatRow label="Avg FAAB Remaining"
                    value={`$${moves.avg_faab_remaining}`}
                    sub={`${moves.faab_seasons} seasons tracked`}
                    accent={moves.avg_faab_remaining>=0?GREEN:RED}/>
                )}
              </Card>

              <SectionLabel label="Trade Highlights"/>
              <Card>
                <StatRow label="Avg Trades / Season" value={trades.avg_trades_per_season??'—'}/>
                {trades.top_trade_partner&&(
                  <StatRow label="Top Trade Partner"
                    value={trades.top_trade_partner.display_name}
                    sub={`${trades.top_trade_partner.trade_count} trades`}/>
                )}
                {trades.most_traded_player&&(
                  <StatRow label="Most Traded Player"
                    value={trades.most_traded_player.player_name}
                    sub={`${trades.most_traded_player.times_traded}×`} last/>
                )}
              </Card>

              {draft.most_drafted_by_pos&&Object.keys(draft.most_drafted_by_pos).length>0&&(
                <>
                  <SectionLabel label="Most Drafted by Position"/>
                  <Card>
                    {Object.entries(draft.most_drafted_by_pos).map(([pos,p],i,arr)=>(
                      <div key={pos} style={{display:'flex',alignItems:'center',gap:8,
                        padding:'9px 12px',
                        borderBottom:i<arr.length-1?'0.5px solid rgba(212,168,67,0.08)':'none'}}>
                        <PosChip pos={pos}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,color:TEXT_1,fontWeight:500}}>{p.player_name}</div>
                        </div>
                        <div style={{fontSize:12,fontWeight:500,color:GOLD}}>{p.times_drafted}×</div>
                      </div>
                    ))}
                  </Card>
                  {(draft.avg_pick_snake||draft.avg_auction_top_cost)&&(
                    <Card>
                      {draft.avg_pick_snake&&(
                        <StatRow label="Avg Snake Pick" value={`#${draft.avg_pick_snake}`}/>
                      )}
                      {draft.avg_auction_top_cost&&(
                        <StatRow label="Avg Auction Top Cost" value={`$${draft.avg_auction_top_cost}`}
                          accent={GOLD} last/>
                      )}
                    </Card>
                  )}
                </>
              )}
            </>
          )}

          {/* Year view: full add/drop/trade lists */}
          {isYearView&&(
            <>
              {allAdds.length>0&&(
                <>
                  <SectionLabel label="Adds"/>
                  <Card>
                    <div onClick={()=>setMovesModal({label:`${season} Adds`,moves:allAdds})}
                      style={{padding:'12px 14px',display:'flex',justifyContent:'space-between',
                        alignItems:'center',cursor:'pointer'}}>
                      <span style={{fontSize:12,color:TEXT_1}}>View all {allAdds.length} adds</span>
                      <span style={{fontSize:11,color:TEXT_3}}>›</span>
                    </div>
                    {allAdds.slice(0,3).map((m,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:8,
                        padding:'7px 12px',borderTop:'0.5px solid rgba(212,168,67,0.06)'}}>
                        <PosChip pos={m.position}/>
                        <span style={{fontSize:11,color:TEXT_1,flex:1}}>{m.player_name}</span>
                        {m.waiver_bid!=null&&<span style={{fontSize:10,color:GOLD}}>${m.waiver_bid}</span>}
                        <span style={{fontSize:9,color:TEXT_3}}>{m.date}</span>
                      </div>
                    ))}
                  </Card>
                </>
              )}

              {allDrops.length>0&&(
                <>
                  <SectionLabel label="Drops"/>
                  <Card>
                    <div onClick={()=>setMovesModal({label:`${season} Drops`,moves:allDrops.map(m=>({...m,type:'drop'}))})}
                      style={{padding:'12px 14px',display:'flex',justifyContent:'space-between',
                        alignItems:'center',cursor:'pointer'}}>
                      <span style={{fontSize:12,color:TEXT_1}}>View all {allDrops.length} drops</span>
                      <span style={{fontSize:11,color:TEXT_3}}>›</span>
                    </div>
                    {allDrops.slice(0,3).map((m,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:8,
                        padding:'7px 12px',borderTop:'0.5px solid rgba(212,168,67,0.06)'}}>
                        <PosChip pos={m.position}/>
                        <span style={{fontSize:11,color:TEXT_1,flex:1}}>{m.player_name}</span>
                        <span style={{fontSize:9,color:TEXT_3}}>{m.date}</span>
                      </div>
                    ))}
                  </Card>
                </>
              )}

              {allTrades.length>0&&(
                <>
                  <SectionLabel label="Trades"/>
                  <div onClick={()=>setTradesModal({label:`${season} Trades`,trades:allTrades})}
                    style={{margin:'0 14px 10px',background:BG_CARD,borderRadius:10,
                      border:`0.5px solid ${GOLD_BORDER}`,padding:'12px 14px',
                      display:'flex',justifyContent:'space-between',cursor:'pointer'}}>
                    <span style={{fontSize:12,color:TEXT_1}}>View all {allTrades.length} trades</span>
                    <span style={{fontSize:11,color:TEXT_3}}>›</span>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── MATCHUPS ──────────────────────────────────────────────────────────────────
function MatchupsTab({name}) {
  const [view,setView]         = useState('era')
  const [era,setEra]           = useState('all_time')
  const [season,setSeason]     = useState(null)
  const [seasons,setSeasons]   = useState([])
  const [eraData,setEraData]   = useState({})
  const [yrData,setYrData]     = useState({})
  const [loading,setLoading]   = useState(false)
  const [expanded,setExpanded] = useState(null)

  useEffect(()=>{
    fetch(`${API}/fantasy/${name}/overview`)
      .then(r=>r.json())
      .then(d=>{
        const latest = new Date().getFullYear()
        const played = d.seasons_played || 10
        const yrs = Array.from({length:played},(_,i)=>latest-i).filter(y=>y>=2007)
        if (yrs.length){setSeasons(yrs);setSeason(yrs[0])}
      }).catch(()=>{})
  },[name])

  useEffect(()=>{
    if (eraData[era]) return
    fetch(`${API}/fantasy/${name}/matchups?era=${era}`)
      .then(r=>r.json())
      .then(d=>setEraData(prev=>({...prev,[era]:d})))
      .catch(()=>{})
  },[era,name])

  useEffect(()=>{
    if (!season||yrData[season]) return
    setLoading(true)
    fetch(`${API}/fantasy/${name}/matchups/${season}`)
      .then(r=>r.json())
      .then(d=>{setYrData(prev=>({...prev,[season]:d}));setLoading(false)})
      .catch(()=>setLoading(false))
  },[season,name])

  const eraD           = eraData[era] || {}
  const vsOpponents    = view==='era'
    ? (eraD.vs_opponents || [])
    : []
  const d              = yrData[season] || {}
  const weeklyMatchups = d.weekly_matchups || []

  const sortPlayers = ps => [...(ps||[])].sort((a,b)=>{
    const ai=POS_ORDER.indexOf(a.selected_position||a.position)
    const bi=POS_ORDER.indexOf(b.selected_position||b.position)
    return (ai===-1?99:ai)-(bi===-1?99:bi)
  })

  return (
    <div style={{paddingBottom:24}}>

      {/* Era / Season toggle */}
      <ViewToggle value={view} onChange={v=>{setView(v);setExpanded(null)}}/>
      {view==='era'
        ? <EraToggle value={era} onChange={setEra}/>
        : seasons.length>0&&season&&(
            <SeasonPicker seasons={seasons} current={season}
              onChange={v=>{setSeason(v);setExpanded(null)}}/>
          )
      }

      {/* ERA VIEW — vs opponents summary */}
      {view==='era' && (
        vsOpponents.length===0
          ? <div style={{padding:40,textAlign:'center',color:TEXT_3,fontSize:12}}>Loading…</div>
          : <>
              <SectionLabel label="vs All Opponents"/>
              <Card>
                {[...vsOpponents]
                  .sort((a,b)=>(b.combined?.wins||0)-(a.combined?.wins||0))
                  .map((opp,i,arr)=>{
                    const rs=opp.regular_season||{}
                    const po=opp.playoffs||{}
                    const winPct=(rs.wins+rs.losses)>0?rs.wins/(rs.wins+rs.losses):null
                    return (
                      <div key={opp.manager_id} style={{padding:'9px 12px',
                        borderBottom:i<arr.length-1?'0.5px solid rgba(212,168,67,0.06)':'none'}}>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <Avatar managerId={opp.manager_id} size={26}/>
                          <div style={{flex:1}}>
                            <div style={{fontSize:12,fontWeight:500,color:TEXT_1}}>{opp.display_name}</div>
                            {opp.last_matchup&&(
                              <div style={{fontSize:9,color:TEXT_3,marginTop:1}}>
                                Last: {opp.last_matchup.result} · {opp.last_matchup.year} Wk {opp.last_matchup.week}
                                {` (${opp.last_matchup.my_pts}–${opp.last_matchup.opp_pts})`}
                              </div>
                            )}
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontSize:13,fontWeight:600,
                              color:winPct===null?TEXT_3:winPct>0.5?GREEN:winPct<0.5?RED:TEXT_2}}>
                              {rs.wins}–{rs.losses}
                            </div>
                            {(po.wins||po.losses)?(
                              <div style={{fontSize:9,color:TEXT_3}}>PO: {po.wins||0}–{po.losses||0}</div>
                            ):null}
                          </div>
                        </div>
                        {rs.avg_pf&&(
                          <div style={{display:'flex',gap:12,marginTop:5,paddingLeft:36}}>
                            {[
                              {l:'Avg PF',v:rs.avg_pf?.toFixed(1)},
                              {l:'Avg PA',v:rs.avg_pa?.toFixed(1)},
                              {l:'Diff',v:rs.avg_diff!=null?`${rs.avg_diff>0?'+':''}${rs.avg_diff.toFixed(1)}`:'—',
                               c:rs.avg_diff>0?GREEN:rs.avg_diff<0?RED:TEXT_2},
                            ].map(s=>(
                              <div key={s.l} style={{textAlign:'center'}}>
                                <div style={{fontSize:7,color:TEXT_3,marginBottom:1}}>{s.l}</div>
                                <div style={{fontSize:10,color:s.c||TEXT_2,fontWeight:500}}>{s.v||'—'}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </Card>
            </>
      )}

      {/* SEASON VIEW — weekly matchups */}
      {view==='season' && (
        loading
          ? <div style={{padding:30,textAlign:'center',color:TEXT_3,fontSize:12}}>Loading…</div>
          : weeklyMatchups.length===0
            ? <div style={{padding:30,textAlign:'center',color:TEXT_3,fontSize:12}}>
                No matchup data for {season}.
              </div>
            : <>
                <SectionLabel label={`${season} Season`}/>
          {weeklyMatchups.map((wk,idx)=>{
            const opp      = wk.opponent||{}
            const isOpen   = expanded===idx
            const isWin    = wk.result==='W'
            const myPts    = wk.my_points
            const oppPts   = wk.opp_points
            const diff     = wk.diff
            const myPlayers  = sortPlayers(wk.my_roster||[])
            const oppPlayers = sortPlayers(wk.opp_roster||[])
            const maxRows    = Math.max(myPlayers.length,oppPlayers.length)
            const hasPlayers = wk.players_available&&myPlayers.length>0

            return (
              <div key={idx} onClick={()=>hasPlayers&&setExpanded(i=>i===idx?null:idx)}
                style={{margin:'0 14px 8px',background:BG_CARD,borderRadius:10,
                  border:`0.5px solid ${wk.is_playoffs?'rgba(212,168,67,0.4)':GOLD_BORDER}`,
                  overflow:'hidden',cursor:hasPlayers?'pointer':'default'}}>
                <div style={{padding:'8px 12px'}}>
                  {/* Top line: week label + playoff badge */}
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                    <span style={{fontSize:9,color:TEXT_3}}>
                      {wk.is_playoffs?'🏆 ':''}{wk.is_playoffs?'Playoffs':'RS'} · Wk {wk.week}
                    </span>
                    {hasPlayers&&(
                      <span style={{marginLeft:'auto',fontSize:10,color:TEXT_3,
                        transform:isOpen?'rotate(180deg)':'none',
                        transition:'transform 0.2s'}}>▼</span>
                    )}
                  </div>
                  {/* Score row: my pts | diff | opp info + pts */}
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {/* My score */}
                    <div style={{fontSize:20,fontWeight:700,color:isWin?GREEN:RED,
                      flexShrink:0,minWidth:52}}>
                      {myPts?.toFixed(1)??'—'}
                    </div>
                    {/* Diff */}
                    <div style={{flex:1,textAlign:'center'}}>
                      {diff!=null&&(
                        <div style={{fontSize:11,fontWeight:600,
                          color:diff>0?GREEN:RED}}>
                          {diff>0?'+':''}{diff.toFixed(1)}
                        </div>
                      )}
                    </div>
                    {/* Opponent */}
                    <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                      <div style={{textAlign:'right',minWidth:0}}>
                        <div style={{fontSize:11,color:TEXT_1,fontWeight:500,
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                          maxWidth:90}}>
                          {opp.display_name}
                        </div>
                        <div style={{fontSize:8,color:TEXT_3,
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                          maxWidth:90}}>
                          {opp.team_name}
                        </div>
                      </div>
                      <Avatar managerId={opp.manager_id} size={28}/>
                      <div style={{fontSize:20,fontWeight:700,color:isWin?RED:GREEN,
                        flexShrink:0,minWidth:52,textAlign:'right'}}>
                        {oppPts?.toFixed(1)??'—'}
                      </div>
                    </div>
                  </div>
                </div>

                {isOpen&&hasPlayers&&(
                  <div style={{borderTop:'0.5px solid rgba(212,168,67,0.12)',padding:'8px 10px'}}>
                    {/* Proj row */}
                    {wk.my_projected&&(
                      <div style={{display:'flex',justifyContent:'space-between',
                        padding:'3px 0 6px',marginBottom:4,
                        borderBottom:'0.5px solid rgba(212,168,67,0.08)'}}>
                        <span style={{fontSize:9,color:TEXT_3}}>
                          Proj: {wk.my_projected?.toFixed(1)}
                        </span>
                        <span style={{fontSize:9,color:TEXT_3}}>PROJ</span>
                        <span style={{fontSize:9,color:TEXT_3}}>
                          {wk.opp_projected?.toFixed(1)}
                        </span>
                      </div>
                    )}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 40px 1fr',
                      gap:4,paddingBottom:4,marginBottom:4,
                      borderBottom:'0.5px solid rgba(212,168,67,0.1)'}}>
                      <span style={{fontSize:8,fontWeight:500,color:TEXT_2}}>Me</span>
                      <span style={{fontSize:8,color:TEXT_3,textAlign:'center'}}>POS</span>
                      <span style={{fontSize:8,fontWeight:500,color:TEXT_2,textAlign:'right'}}>
                        {opp.display_name}
                      </span>
                    </div>
                    {Array.from({length:maxRows}).map((_,pi)=>{
                      const pA=myPlayers[pi], pB=oppPlayers[pi]
                      const pos=(pA?.selected_position||pB?.selected_position||'—')
                      const pc=POS_COLORS[pos]||TEXT_3
                      const aPts = pA?.points??pA?.week_pts
                      const bPts = pB?.points??pB?.week_pts
                      const aWins=aPts!=null&&bPts!=null?aPts>bPts:null
                      return (
                        <div key={pi} style={{display:'grid',gridTemplateColumns:'1fr 40px 1fr',
                          gap:4,padding:'4px 0',
                          borderBottom:'0.5px solid rgba(212,168,67,0.05)',alignItems:'start'}}>
                          <div>
                            {pA?<>
                              <div style={{fontSize:11,fontWeight:500,
                                color:aWins===true?GREEN:aWins===false?RED:TEXT_2}}>
                                {aPts?.toFixed(1)??'—'}
                              </div>
                              <div style={{fontSize:9,color:TEXT_2,lineHeight:1.3}}>
                                {pA.player_name?.split(' ').pop()||pA.name?.split(' ').pop()}
                              </div>
                              {pA.is_on_bench&&<div style={{fontSize:7,color:'#5B9BD5'}}>BN</div>}
                            </>:<div style={{fontSize:9,color:TEXT_3}}>—</div>}
                          </div>
                          <div style={{textAlign:'center',paddingTop:2}}>
                            <span style={{fontSize:7,color:pc,background:`${pc}22`,
                              border:`0.5px solid ${pc}44`,borderRadius:4,
                              padding:'1px 4px',display:'inline-block'}}>{pos}</span>
                          </div>
                          <div style={{textAlign:'right'}}>
                            {pB?<>
                              <div style={{fontSize:11,fontWeight:500,
                                color:aWins===false?GREEN:aWins===true?RED:TEXT_2}}>
                                {bPts?.toFixed(1)??'—'}
                              </div>
                              <div style={{fontSize:9,color:TEXT_2,lineHeight:1.3}}>
                                {pB.player_name?.split(' ').pop()||pB.name?.split(' ').pop()}
                              </div>
                              {pB.is_on_bench&&<div style={{fontSize:7,color:'#5B9BD5',textAlign:'right'}}>BN</div>}
                            </>:<div style={{fontSize:9,color:TEXT_3}}>—</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
              })}
            </>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ManagerScreen() {
  const {name}          = useParams()
  const [activeTab,setActiveTab] = useState('overview')

  // Reset to overview when navigating to a different manager
  useEffect(()=>{ setActiveTab('overview') },[name])

  return (
    <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column'}}>
      <SectionNav tabs={TABS} activeKey={activeTab} onSelect={setActiveTab}/>
      <div style={{flex:1,overflowY:'auto'}}>
        {activeTab==='overview'     && <OverviewTab      name={name}/>}
        {activeTab==='results'      && <ResultsTab       name={name}/>}
        {activeTab==='transactions' && <TransactionsTab  name={name}/>}
        {activeTab==='matchups'     && <MatchupsTab      name={name}/>}
      </div>
    </div>
  )
}