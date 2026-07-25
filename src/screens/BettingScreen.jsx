// src/screens/BettingScreen.jsx
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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

const CAN_MANAGE  = ['brian','frank','zef']
const ACTIVE_MEMBERS = [
  { manager_id:'blake',  display_name:'Blake'  },
  { manager_id:'brian',  display_name:'Brian'  },
  { manager_id:'frank',  display_name:'Frank'  },
  { manager_id:'jake',   display_name:'Jake'   },
  { manager_id:'joey',   display_name:'Joey'   },
  { manager_id:'jordan', display_name:'Jordan' },
  { manager_id:'kyle',   display_name:'Kyle'   },
  { manager_id:'nick',   display_name:'Nick'   },
  { manager_id:'rob',    display_name:'Rob'    },
  { manager_id:'zef',    display_name:'Zef'    },
]

const BOTTOM_TABS = [
  { key:'parlays',    label:'Parlays',    icon:'/icons/parlays-icon.png',  path:'/betting/parlays'    },
  { key:'water-bets', label:'Water Bets', icon:'/icons/water-bets-icon.png',  path:'/betting/water-bets' },
  { key:'season',     label:'Season',     icon:'/icons/season-icon.png',   path:'/betting/season'     },
  { key:'overall',    label:'Overall',    icon:'/icons/league-icon.png',   path:'/betting/overall'    },
]

function SeasonWeekNav({ season, week, seasons, onChangeSeason, onChangeWeek, maxWeek }) {
  const [showPicker, setShowPicker] = useState(false)
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'10px 14px 6px' }}>
      <button onClick={() => onChangeWeek(w => Math.max(1, w-1))} disabled={week <= 1}
        style={{ width:28, height:28, borderRadius:'50%', border:`0.5px solid ${week>1?GOLD_BORDER:'rgba(255,255,255,0.06)'}`,
          background:BG_CARD, cursor:week>1?'pointer':'default', display:'flex', alignItems:'center',
          justifyContent:'center', color:week>1?GOLD:TEXT_3, fontSize:14 }}>‹</button>
      <div style={{ position:'relative' }}>
        <button onClick={() => setShowPicker(p=>!p)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:18,
            border:`1px solid ${GOLD_BORDER}`, background:GOLD_DIM, cursor:'pointer',
            fontSize:12, fontWeight:500, color:GOLD }}>
          Week {week} · {season} <span style={{ fontSize:9, color:TEXT_2 }}>▼</span>
        </button>
        {showPicker && (
          <div style={{ position:'absolute', top:'110%', left:'50%', transform:'translateX(-50%)',
            background:'#1a1a1a', border:`0.5px solid ${GOLD_BORDER}`, borderRadius:10, zIndex:20,
            minWidth:160, maxHeight:280, overflowY:'auto', boxShadow:'0 8px 24px rgba(0,0,0,0.6)' }}>
            {seasons.map(s => (
              <div key={s} style={{ padding:'8px 14px', fontSize:12, fontWeight:500,
                color:s===season?GOLD:TEXT_2, background:s===season?GOLD_DIM:'transparent',
                borderBottom:`0.5px solid rgba(212,168,67,0.08)`, cursor:'pointer' }}
                onClick={() => { onChangeSeason(s); setShowPicker(false) }}>
                Season {s}
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={() => onChangeWeek(w => Math.min(maxWeek||17, w+1))} disabled={week>=(maxWeek||17)}
        style={{ width:28, height:28, borderRadius:'50%', border:`0.5px solid ${week<(maxWeek||17)?GOLD_BORDER:'rgba(255,255,255,0.06)'}`,
          background:BG_CARD, cursor:week<(maxWeek||17)?'pointer':'default', display:'flex', alignItems:'center',
          justifyContent:'center', color:week<(maxWeek||17)?GOLD:TEXT_3, fontSize:14 }}>›</button>
    </div>
  )
}

function ResultBadge({ result, size='normal' }) {
  const cfg = {
    hit:     { label:'HIT',     bg:'rgba(93,191,106,0.15)',  border:'rgba(93,191,106,0.4)',  color:GREEN },
    miss:    { label:'MISS',    bg:'rgba(207,95,95,0.15)',   border:'rgba(207,95,95,0.4)',   color:RED   },
    no_leg:  { label:'NO LEG', bg:'rgba(255,255,255,0.06)', border:'rgba(255,255,255,0.12)',color:TEXT_3 },
    waiting: { label:'–',       bg:'rgba(212,168,67,0.06)',  border:GOLD_BORDER,             color:TEXT_3 },
  }
  const c = cfg[result] || cfg.waiting
  const fs = size==='small' ? 8 : 9
  return (
    <div style={{ padding:'3px 8px', borderRadius:10, background:c.bg,
      border:`0.5px solid ${c.border}`, fontSize:fs, fontWeight:600,
      color:c.color, letterSpacing:'0.06em', flexShrink:0 }}>{c.label}</div>
  )
}

// ── PARLAYS ───────────────────────────────────────────────────────────────────
function ParlaysTab({ currentUser }) {
  const user = currentUser
  const canManage   = CAN_MANAGE.includes(user.manager_id)
  const [view, setView]         = useState(canManage ? 'view' : 'view')
  const [season, setSeason]     = useState(2026)
  const [week, setWeek]         = useState(1)
  const [parlay, setParlay]     = useState(null)
  const [options, setOptions]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [availableWeeks, setAvailableWeeks] = useState([])
  const [seasons, setSeasons]   = useState([2026])

  // Manage parlay state
  const [legs, setLegs]         = useState({})
  const [saving, setSaving]     = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)

  useEffect(() => {
    fetch(`${API}/betting/parlay-options`)
      .then(r=>r.json()).then(setOptions).catch(()=>{})
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/betting/parlays?season=${season}&week=${week}`)
      .then(r=>r.json())
      .then(d => {
        setParlay(d)
        setAvailableWeeks(d.available_weeks||[])
        const allSeasons = [...new Set((d.available_weeks||[]).map(w=>w.season))].sort((a,b)=>b-a)
        if (allSeasons.length) setSeasons(allSeasons)
        // Init leg state from existing data
        const legMap = {}
        ;(d.parlay?.legs||[]).forEach(l => { legMap[l.manager_id] = {...l} })
        setLegs(legMap)
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [season, week])

  const updateLeg = (managerId, field, value) => {
    setLegs(prev => ({ ...prev, [managerId]: { ...prev[managerId], [field]:value } }))
  }

  const handleSubmitParlay = async () => {
    setSaving(true); setSaveStatus(null)
    try {
      const legArr = ACTIVE_MEMBERS.map(m => ({
        manager_id:  m.manager_id,
        player_name: legs[m.manager_id]?.player_name || null,
        player_pos:  legs[m.manager_id]?.player_pos  || null,
        stat_count:  legs[m.manager_id]?.stat_count  ? parseFloat(legs[m.manager_id].stat_count) : null,
        stat_op:     legs[m.manager_id]?.stat_op     || null,
        stat_type:   legs[m.manager_id]?.stat_type   || null,
      }))
      const noLeg = ACTIVE_MEMBERS
        .filter(m => legs[m.manager_id]?.result === 'no_leg')
        .map(m => m.manager_id)
      await fetch(`${API}/betting/parlays/submit`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ season, week, entered_by:user.manager_id,
          no_leg_managers:noLeg, legs:legArr.filter(l=>!noLeg.includes(l.manager_id)) })
      })
      setSaveStatus({type:'success', msg:'Parlay submitted!'})
    } catch(e) { setSaveStatus({type:'error', msg:'Failed to submit.'}) }
    finally { setSaving(false) }
  }

  const handleUpdateLeg = async (managerId) => {
    const leg = legs[managerId]
    if (!leg) return
    try {
      await fetch(`${API}/betting/parlays/${season}/${week}/update-leg/${managerId}`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ updated_by:user.manager_id, result:leg.result||'waiting',
          player_name:leg.player_name, player_pos:leg.player_pos,
          stat_count:leg.stat_count?parseFloat(leg.stat_count):null,
          stat_op:leg.stat_op, stat_type:leg.stat_type })
      })
    } catch(e) { console.error(e) }
  }

  const maxWeek = availableWeeks.filter(w=>w.season===season).length
    ? Math.max(...availableWeeks.filter(w=>w.season===season).map(w=>w.week))
    : 17

  const parlayExists = parlay?.parlay?.exists
  const wkResult     = parlay?.parlay?.week_result
  const currentLegs  = parlay?.parlay?.legs || []

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:16 }}>
      {/* View toggle for managers */}
      {canManage && (
        <div style={{ display:'flex', margin:'10px 14px 0', background:BG_CARD,
          borderRadius:10, border:`0.5px solid ${GOLD_BORDER}`, padding:3, gap:3 }}>
          {[{k:'view',l:'View Parlays'},{k:'manage',l:'Manage Parlays'}].map(o => (
            <button key={o.k} onClick={() => setView(o.k)}
              style={{ flex:1, padding:'7px', borderRadius:8, border:'none', cursor:'pointer',
                background:view===o.k?GOLD_DIM:'transparent',
                borderWidth:view===o.k?1:0, borderStyle:'solid', borderColor:view===o.k?GOLD:'transparent',
                fontSize:10, color:view===o.k?GOLD:TEXT_3, fontWeight:view===o.k?600:400,
                textTransform:'uppercase', letterSpacing:'0.06em' }}>{o.l}</button>
          ))}
        </div>
      )}

      <SeasonWeekNav season={season} week={week} seasons={seasons}
        onChangeSeason={s=>{setSeason(s);setWeek(1)}}
        onChangeWeek={fn=>setWeek(fn)} maxWeek={maxWeek}/>

      {loading ? (
        <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>Loading…</div>
      ) : view === 'manage' && canManage ? (
        // ── MANAGE VIEW ────────────────────────────────────────────────────────
        <div style={{ padding:'0 14px 24px' }}>
          {wkResult && (
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              {[{l:'Hit',v:wkResult.total_hit,c:GREEN},{l:'Miss',v:wkResult.total_miss,c:RED},
                {l:'No Leg',v:wkResult.total_no_leg,c:TEXT_3},{l:'Waiting',v:wkResult.total_waiting,c:TEXT_2}
              ].map(s => (
                <div key={s.l} style={{ flex:1, background:BG_CARD, borderRadius:8,
                  border:`0.5px solid ${GOLD_BORDER}`, padding:'8px 4px', textAlign:'center' }}>
                  <div style={{ fontSize:8, color:TEXT_3, marginBottom:2 }}>{s.l}</div>
                  <div style={{ fontSize:16, fontWeight:600, color:s.c }}>{s.v||0}</div>
                </div>
              ))}
            </div>
          )}

          {ACTIVE_MEMBERS.map(m => {
            const leg = legs[m.manager_id] || {}
            const isNoLeg = leg.result === 'no_leg'
            return (
              <div key={m.manager_id} style={{ background:BG_CARD, borderRadius:10,
                border:`0.5px solid ${GOLD_BORDER}`, marginBottom:8, padding:'10px 12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:isNoLeg?0:10 }}>
                  <Avatar managerId={m.manager_id} size={28}/>
                  <span style={{ fontSize:13, fontWeight:500, color:TEXT_1, flex:1 }}>
                    {m.display_name}
                  </span>
                  {/* No leg toggle */}
                  <button onClick={() => updateLeg(m.manager_id, 'result',
                    leg.result==='no_leg'?'waiting':'no_leg')}
                    style={{ padding:'3px 10px', borderRadius:10, border:'none', cursor:'pointer',
                      background:isNoLeg?'rgba(255,255,255,0.1)':GOLD_DIM,
                      fontSize:9, color:isNoLeg?TEXT_3:GOLD }}>
                    {isNoLeg ? 'No Leg ✓' : 'No Leg'}
                  </button>
                </div>

                {!isNoLeg && (
                  <>
                    {/* Player + position */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 80px', gap:6, marginBottom:6 }}>
                      <input value={leg.player_name||''} placeholder="Player name"
                        onChange={e => updateLeg(m.manager_id,'player_name',e.target.value)}
                        style={{ padding:'7px 10px', borderRadius:8,
                          border:`0.5px solid ${GOLD_BORDER}`, background:'#252525',
                          color:TEXT_1, fontSize:12 }}/>
                      <select value={leg.player_pos||''}
                        onChange={e => updateLeg(m.manager_id,'player_pos',e.target.value)}
                        style={{ padding:'7px 8px', borderRadius:8,
                          border:`0.5px solid ${GOLD_BORDER}`, background:'#252525',
                          color:leg.player_pos?TEXT_1:TEXT_3, fontSize:12, cursor:'pointer' }}>
                        <option value="">Pos</option>
                        {(options?.player_positions||[]).map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                    {/* Stat line */}
                    <div style={{ display:'grid', gridTemplateColumns:'60px 70px 1fr', gap:6, marginBottom:8 }}>
                      <input type="number" value={leg.stat_count||''} placeholder="Count"
                        onChange={e => updateLeg(m.manager_id,'stat_count',e.target.value)}
                        style={{ padding:'7px 8px', borderRadius:8,
                          border:`0.5px solid ${GOLD_BORDER}`, background:'#252525',
                          color:TEXT_1, fontSize:12 }}/>
                      <select value={leg.stat_op||''}
                        onChange={e => updateLeg(m.manager_id,'stat_op',e.target.value)}
                        style={{ padding:'7px 6px', borderRadius:8,
                          border:`0.5px solid ${GOLD_BORDER}`, background:'#252525',
                          color:leg.stat_op?TEXT_1:TEXT_3, fontSize:11, cursor:'pointer' }}>
                        <option value="">Op</option>
                        {(options?.stat_operations||[]).map(o =>
                          <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <select value={leg.stat_type||''}
                        onChange={e => updateLeg(m.manager_id,'stat_type',e.target.value)}
                        style={{ padding:'7px 8px', borderRadius:8,
                          border:`0.5px solid ${GOLD_BORDER}`, background:'#252525',
                          color:leg.stat_type?TEXT_1:TEXT_3, fontSize:11, cursor:'pointer' }}>
                        <option value="">Stat type</option>
                        {(options?.stat_types||[]).map(s =>
                          <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    {/* Result radio */}
                    {parlayExists && (
                      <div style={{ display:'flex', gap:6 }}>
                        {['waiting','hit','miss'].map(r => (
                          <button key={r} onClick={() => updateLeg(m.manager_id,'result',r)}
                            style={{ flex:1, padding:'5px', borderRadius:8, border:'none', cursor:'pointer',
                              background:leg.result===r
                                ? r==='hit'?'rgba(93,191,106,0.2)':r==='miss'?'rgba(207,95,95,0.2)':GOLD_DIM
                                : 'rgba(255,255,255,0.04)',
                              borderWidth:leg.result===r?1:0.5, borderStyle:'solid',
                              borderColor:leg.result===r
                                ? r==='hit'?GREEN:r==='miss'?RED:GOLD
                                : 'rgba(255,255,255,0.06)',
                              fontSize:9, fontWeight:leg.result===r?600:400,
                              color:leg.result===r
                                ? r==='hit'?GREEN:r==='miss'?RED:GOLD
                                : TEXT_3,
                              textTransform:'uppercase' }}>
                            {r==='waiting'?'–':r}
                          </button>
                        ))}
                        <button onClick={() => handleUpdateLeg(m.manager_id)}
                          style={{ padding:'5px 10px', borderRadius:8, border:'none', cursor:'pointer',
                            background:GOLD_DIM, borderWidth:1, borderStyle:'solid',
                            borderColor:GOLD, fontSize:9, color:GOLD }}>Save</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}

          {saveStatus && (
            <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:12,
              background:saveStatus.type==='success'?'rgba(93,191,106,0.1)':'rgba(207,95,95,0.1)',
              border:`0.5px solid ${saveStatus.type==='success'?'rgba(93,191,106,0.3)':'rgba(207,95,95,0.3)'}`,
              fontSize:12, color:saveStatus.type==='success'?GREEN:RED }}>
              {saveStatus.msg}
            </div>
          )}

          {!parlayExists && (
            <button onClick={handleSubmitParlay} disabled={saving}
              style={{ width:'100%', padding:'13px', borderRadius:12, border:'none', cursor:'pointer',
                background:GOLD_DIM, borderWidth:1, borderStyle:'solid', borderColor:GOLD,
                fontSize:13, fontWeight:600, color:GOLD, marginTop:8 }}>
              {saving ? 'Submitting…' : 'Submit Parlay'}
            </button>
          )}
        </div>
      ) : (
        // ── VIEW MODE ──────────────────────────────────────────────────────────
        <div style={{ padding:'0 14px 24px' }}>
          {!parlayExists ? (
            <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>
              No parlay entered for Week {week} · {season}.
            </div>
          ) : (
            <>
              {wkResult && (
                <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                  {[{l:'Hit',v:wkResult.total_hit,c:GREEN},{l:'Miss',v:wkResult.total_miss,c:RED},
                    {l:'No Leg',v:wkResult.total_no_leg,c:TEXT_3},{l:'Waiting',v:wkResult.total_waiting,c:TEXT_2}
                  ].map(s => (
                    <div key={s.l} style={{ flex:1, background:BG_CARD, borderRadius:8,
                      border:`0.5px solid ${GOLD_BORDER}`, padding:'8px 4px', textAlign:'center' }}>
                      <div style={{ fontSize:8, color:TEXT_3, marginBottom:2 }}>{s.l}</div>
                      <div style={{ fontSize:16, fontWeight:600, color:s.c }}>{s.v||0}</div>
                    </div>
                  ))}
                </div>
              )}
              {currentLegs.map(leg => (
                <div key={leg.manager_id} style={{ display:'flex', alignItems:'flex-start',
                  gap:10, padding:'10px 0',
                  borderBottom:`0.5px solid rgba(212,168,67,0.08)` }}>
                  <Avatar managerId={leg.manager_id} size={30}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:TEXT_1, marginBottom:2 }}>
                      {leg.display_name}
                    </div>
                    {leg.result !== 'no_leg' && leg.player_name ? (
                      <div style={{ fontSize:11, color:TEXT_2 }}>
                        {leg.player_name}
                        {leg.player_pos && ` (${leg.player_pos})`}
                        {leg.stat_count && leg.stat_op && leg.stat_type &&
                          ` · ${leg.stat_count} ${leg.stat_op} ${leg.stat_type.replace(/_/g,' ')}`}
                      </div>
                    ) : null}
                  </div>
                  <ResultBadge result={leg.result}/>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── WATER BETS ────────────────────────────────────────────────────────────────
function WaterBetsTab({ currentUser }) {
  const user      = currentUser
  const canManage = CAN_MANAGE.includes(user.manager_id)

  const [season, setSeason]   = useState(2026)
  const [seasons, setSeasons] = useState([2026])
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newBet, setNewBet]   = useState({
    submitted_by:'', submitted_by_display:'',
    opposing_manager:'', opposing_manager_display:'',
    bet_text:'', ending_week:17
  })
  const [creating, setCreating] = useState(false)
  const [createStatus, setCreateStatus] = useState(null)

  const load = () => {
    setLoading(true)
    fetch(`${API}/betting/water-bets?season=${season}`)
      .then(r=>r.json())
      .then(d => {
        setData(d)
        setLoading(false)
        const av = d.available_seasons || []
        if (av.length) setSeasons([...av].sort((a,b)=>b-a))
      }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [season])

  const handleCreate = async () => {
    setCreating(true); setCreateStatus(null)
    try {
      await fetch(`${API}/betting/water-bets/submit`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ season, ...newBet,
          ending_week: parseInt(newBet.ending_week)||17 })
      })
      setCreateStatus({type:'success', msg:'Water bet created!'})
      setShowCreate(false)
      load()
    } catch(e) { setCreateStatus({type:'error', msg:'Failed to create.'}) }
    finally { setCreating(false) }
  }

  const handleResult = async (betId, winnerId) => {
    try {
      await fetch(`${API}/betting/water-bets/${betId}/result`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ updated_by:user.manager_id, winner_id:winnerId })
      })
      load()
    } catch(e) { console.error(e) }
  }

  const WaterBetCard = ({ bet }) => {
    const isSubmitter = bet.submitted_by === user.manager_id
    const isOpponent  = bet.opposing_manager === user.manager_id
    const canEdit     = canManage || isSubmitter || isOpponent
    const waiting     = bet.result === 'waiting'
    const submitterWon= bet.result === 'submitter_wins'

    return (
      <div style={{ background:BG_CARD, borderRadius:12,
        border:`0.5px solid ${waiting?GOLD_BORDER:submitterWon?'rgba(93,191,106,0.3)':'rgba(207,95,95,0.25)'}`,
        margin:'0 14px 10px', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', padding:'10px 12px',
          borderBottom:`0.5px solid rgba(212,168,67,0.08)`,
          background:'rgba(212,168,67,0.03)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
            <Avatar managerId={bet.submitted_by} size={24}/>
            <span style={{ fontSize:12, fontWeight:500, color:
              bet.result==='submitter_wins'?GREEN:bet.result==='opponent_wins'?RED:TEXT_1 }}>
              {bet.submitted_by_display}
            </span>
          </div>
          <span style={{ fontSize:11, color:TEXT_3 }}>vs</span>
          <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, justifyContent:'flex-end' }}>
            <span style={{ fontSize:12, fontWeight:500, color:
              bet.result==='opponent_wins'?GREEN:bet.result==='submitter_wins'?RED:TEXT_1 }}>
              {bet.opposing_manager_display}
            </span>
            <Avatar managerId={bet.opposing_manager} size={24}/>
          </div>
        </div>
        {/* Bet text */}
        <div style={{ padding:'10px 12px',
          borderBottom:canEdit&&waiting?`0.5px solid rgba(212,168,67,0.08)`:'none' }}>
          <div style={{ fontSize:12, color:TEXT_1, lineHeight:1.5, marginBottom:6 }}>
            {bet.bet_text}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:9, color:TEXT_3 }}>
              Ends Week {bet.ending_week} · {bet.submitted_at?.slice(0,10)}
            </span>
            {!waiting && (
              <div style={{ padding:'2px 8px', borderRadius:10, fontSize:9, fontWeight:600,
                background:submitterWon?'rgba(93,191,106,0.12)':'rgba(207,95,95,0.1)',
                border:`0.5px solid ${submitterWon?'rgba(93,191,106,0.3)':'rgba(207,95,95,0.25)'}`,
                color:submitterWon?GREEN:RED }}>
                {submitterWon ? `${bet.submitted_by_display} wins` : `${bet.opposing_manager_display} wins`}
              </div>
            )}
          </div>
        </div>
        {/* Result buttons */}
        {canEdit && waiting && (
          <div style={{ display:'flex', gap:6, padding:'8px 12px' }}>
            <button onClick={() => handleResult(bet.id, bet.submitted_by)}
              style={{ flex:1, padding:'7px', borderRadius:8, border:'none', cursor:'pointer',
                background:'rgba(93,191,106,0.1)', border:`0.5px solid rgba(93,191,106,0.25)`,
                fontSize:10, fontWeight:600, color:GREEN }}>
              {bet.submitted_by_display} wins
            </button>
            <button onClick={() => handleResult(bet.id, bet.opposing_manager)}
              style={{ flex:1, padding:'7px', borderRadius:8, border:'none', cursor:'pointer',
                background:'rgba(207,95,95,0.08)', border:`0.5px solid rgba(207,95,95,0.2)`,
                fontSize:10, fontWeight:600, color:RED }}>
              {bet.opposing_manager_display} wins
            </button>
          </div>
        )}
      </div>
    )
  }

  const bets = [...(data?.waiting_bets||[]), ...(data?.resolved_bets||[])]

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:80 }}>
      {/* Season nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
        gap:10, padding:'10px 14px 6px' }}>
        <button onClick={() => { const i=seasons.indexOf(season); if(i<seasons.length-1) setSeason(seasons[i+1]) }}
          disabled={seasons.indexOf(season)>=seasons.length-1}
          style={{ width:28, height:28, borderRadius:'50%', border:`0.5px solid ${GOLD_BORDER}`,
            background:BG_CARD, cursor:'pointer', display:'flex', alignItems:'center',
            justifyContent:'center', color:GOLD, fontSize:14 }}>‹</button>
        <div style={{ padding:'6px 16px', borderRadius:18, border:`1px solid ${GOLD_BORDER}`,
          background:GOLD_DIM, fontSize:12, fontWeight:500, color:GOLD }}>
          Season {season}
        </div>
        <button onClick={() => { const i=seasons.indexOf(season); if(i>0) setSeason(seasons[i-1]) }}
          disabled={seasons.indexOf(season)<=0}
          style={{ width:28, height:28, borderRadius:'50%', border:`0.5px solid ${GOLD_BORDER}`,
            background:BG_CARD, cursor:'pointer', display:'flex', alignItems:'center',
            justifyContent:'center', color:GOLD, fontSize:14 }}>›</button>
      </div>

      {/* Summary */}
      {data && (
        <div style={{ display:'flex', gap:8, margin:'0 14px 12px' }}>
          {[{l:'Total',v:data.total_bets},{l:'Waiting',v:data.waiting_count},{l:'Resolved',v:data.resolved_count}].map(s=>(
            <div key={s.l} style={{ flex:1, background:BG_CARD, borderRadius:8,
              border:`0.5px solid ${GOLD_BORDER}`, padding:'8px 4px', textAlign:'center' }}>
              <div style={{ fontSize:8, color:TEXT_3, marginBottom:2 }}>{s.l}</div>
              <div style={{ fontSize:16, fontWeight:600, color:GOLD }}>{s.v||0}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>Loading…</div>
      ) : bets.length === 0 ? (
        <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>
          No water bets for {season}.
        </div>
      ) : bets.map(b => <WaterBetCard key={b.id} bet={b}/>)}

      {/* Create FAB */}
      <button onClick={() => setShowCreate(true)}
        style={{ position:'fixed', bottom:88, right:20, width:52, height:52,
          borderRadius:'50%', border:'none', cursor:'pointer',
          background:GOLD, display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:24, fontWeight:300, color:'#0f0f0f',
          boxShadow:'0 4px 16px rgba(212,168,67,0.4)', zIndex:10 }}>+</button>

      {/* Create modal */}
      {showCreate && (
        <>
          <div onClick={() => setShowCreate(false)} style={{ position:'fixed', inset:0,
            background:'rgba(0,0,0,0.7)', zIndex:100 }}/>
          <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:110,
            background:'#111', borderRadius:'16px 16px 0 0',
            border:`0.5px solid ${GOLD_BORDER}`, padding:'16px 16px 32px',
            maxHeight:'85vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:16 }}>
              <span style={{ fontSize:13, fontWeight:500, color:GOLD }}>NEW WATER BET</span>
              <button onClick={() => setShowCreate(false)} style={{ background:'none',
                border:'none', color:TEXT_2, fontSize:20, cursor:'pointer' }}>✕</button>
            </div>
            {[
              { label:'Submitted By', field:'submitted_by',
                type:'select', opts:ACTIVE_MEMBERS,
                onChange: v => { const m=ACTIVE_MEMBERS.find(x=>x.manager_id===v)
                  setNewBet(p=>({...p,submitted_by:v,submitted_by_display:m?.display_name||''})) }},
              { label:'Opposing Manager', field:'opposing_manager',
                type:'select', opts:ACTIVE_MEMBERS.filter(m=>m.manager_id!==newBet.submitted_by),
                onChange: v => { const m=ACTIVE_MEMBERS.find(x=>x.manager_id===v)
                  setNewBet(p=>({...p,opposing_manager:v,opposing_manager_display:m?.display_name||''})) }},
              { label:'Bet Text', field:'bet_text', type:'textarea' },
              { label:'Ending Week', field:'ending_week', type:'number' },
            ].map(f => (
              <div key={f.field} style={{ marginBottom:12 }}>
                <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em',
                  textTransform:'uppercase', marginBottom:6 }}>{f.label}</div>
                {f.type === 'select' ? (
                  <select value={newBet[f.field]||''}
                    onChange={e => f.onChange ? f.onChange(e.target.value)
                      : setNewBet(p=>({...p,[f.field]:e.target.value}))}
                    style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                      border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
                      color:newBet[f.field]?TEXT_1:TEXT_3, fontSize:12, cursor:'pointer' }}>
                    <option value="">Select…</option>
                    {f.opts.map(o=><option key={o.manager_id} value={o.manager_id}>{o.display_name}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea value={newBet[f.field]||''} rows={3}
                    onChange={e => setNewBet(p=>({...p,[f.field]:e.target.value}))}
                    placeholder="Enter bet details…"
                    style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                      border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
                      color:TEXT_1, fontSize:12, resize:'none', boxSizing:'border-box',
                      fontFamily:'inherit' }}/>
                ) : (
                  <input type={f.type} value={newBet[f.field]||''}
                    onChange={e => setNewBet(p=>({...p,[f.field]:e.target.value}))}
                    style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                      border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
                      color:TEXT_1, fontSize:12, boxSizing:'border-box' }}/>
                )}
              </div>
            ))}
            {createStatus && (
              <div style={{ padding:'8px 12px', borderRadius:8, marginBottom:10,
                background:createStatus.type==='success'?'rgba(93,191,106,0.1)':'rgba(207,95,95,0.1)',
                fontSize:11, color:createStatus.type==='success'?GREEN:RED }}>
                {createStatus.msg}
              </div>
            )}
            <button onClick={handleCreate} disabled={creating}
              style={{ width:'100%', padding:'12px', borderRadius:10, border:'none',
                cursor:'pointer', background:GOLD_DIM, borderWidth:1, borderStyle:'solid',
                borderColor:GOLD, fontSize:13, fontWeight:600, color:GOLD }}>
              {creating ? 'Creating…' : 'Create Water Bet'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── SEASON ────────────────────────────────────────────────────────────────────
function SeasonTab() {
  const [season, setSeason]   = useState(null)
  const [seasons, setSeasons] = useState([])
  const [data, setData]       = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get available seasons from overall
    fetch(`${API}/betting/overall`)
      .then(r=>r.json())
      .then(d => {
        const s = (d.seasons_tracked||[]).sort((a,b)=>b-a)
        setSeasons(s)
        if (s.length) setSeason(s[0])
      }).catch(()=>{})
  }, [])

  useEffect(() => {
    if (!season || data[season]) return
    setLoading(true)
    fetch(`${API}/betting/season/${season}`)
      .then(r=>r.json())
      .then(d => { setData(prev=>({...prev,[season]:d})); setLoading(false) })
      .catch(() => setLoading(false))
  }, [season])

  const d = data[season]
  const parlayStats = d?.parlay_stats || []
  const wbStats     = d?.water_bet_stats || []

  const sorted = [...parlayStats].sort((a,b) => (b.hit_pct||0)-(a.hit_pct||0))

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:16 }}>
      {seasons.length > 0 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
          gap:10, padding:'10px 14px 6px' }}>
          <button onClick={() => { const i=seasons.indexOf(season); if(i<seasons.length-1) setSeason(seasons[i+1]) }}
            disabled={seasons.indexOf(season)>=seasons.length-1}
            style={{ width:28,height:28,borderRadius:'50%',border:`0.5px solid ${GOLD_BORDER}`,
              background:BG_CARD,cursor:'pointer',display:'flex',alignItems:'center',
              justifyContent:'center',color:GOLD,fontSize:14 }}>‹</button>
          <div style={{ padding:'6px 16px',borderRadius:18,border:`1px solid ${GOLD_BORDER}`,
            background:GOLD_DIM,fontSize:12,fontWeight:500,color:GOLD }}>Season {season}</div>
          <button onClick={() => { const i=seasons.indexOf(season); if(i>0) setSeason(seasons[i-1]) }}
            disabled={seasons.indexOf(season)<=0}
            style={{ width:28,height:28,borderRadius:'50%',border:`0.5px solid ${GOLD_BORDER}`,
              background:BG_CARD,cursor:'pointer',display:'flex',alignItems:'center',
              justifyContent:'center',color:GOLD,fontSize:14 }}>›</button>
        </div>
      )}

      {loading ? (
        <div style={{ padding:40,textAlign:'center',color:TEXT_3,fontSize:12 }}>Loading…</div>
      ) : !d ? null : (
        <>
          {/* Parlay table */}
          <div style={{ fontSize:9,color:TEXT_3,letterSpacing:'0.1em',padding:'12px 14px 6px' }}>
            PARLAY STANDINGS
          </div>
          <div style={{ margin:'0 14px 12px',background:BG_CARD,borderRadius:10,
            border:`0.5px solid ${GOLD_BORDER}`,overflow:'hidden' }}>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 36px 36px 36px 52px 52px 52px',
              padding:'6px 12px',borderBottom:`0.5px solid ${GOLD_BORDER}`,
              background:'rgba(212,168,67,0.04)' }}>
              {['Manager','W','L','NL','Win%','SoloH','SoloM'].map((h,i)=>(
                <span key={h} style={{ fontSize:8,color:TEXT_3,textAlign:i>0?'center':'left',
                  letterSpacing:'0.06em' }}>{h}</span>
              ))}
            </div>
            {sorted.map((m,i)=>(
              <div key={m.manager_id} style={{ display:'grid',
                gridTemplateColumns:'1fr 36px 36px 36px 52px 52px 52px',
                padding:'8px 12px',alignItems:'center',
                borderBottom:i<sorted.length-1?`0.5px solid rgba(212,168,67,0.06)`:'none' }}>
                <div style={{ display:'flex',alignItems:'center',gap:7 }}>
                  <Avatar managerId={m.manager_id} size={22}/>
                  <span style={{ fontSize:11,color:TEXT_1,fontWeight:500 }}>{m.display_name}</span>
                </div>
                <span style={{ fontSize:11,color:GREEN,textAlign:'center' }}>{m.total_hit||0}</span>
                <span style={{ fontSize:11,color:RED,textAlign:'center' }}>{m.total_miss||0}</span>
                <span style={{ fontSize:11,color:TEXT_3,textAlign:'center' }}>{m.total_no_leg||0}</span>
                <span style={{ fontSize:12,fontWeight:600,color:GOLD,textAlign:'center' }}>
                  {m.hit_pct!=null?`${m.hit_pct}%`:'—'}
                </span>
                <span style={{ fontSize:11,color:TEXT_2,textAlign:'center' }}>{m.solo_hit||0}</span>
                <span style={{ fontSize:11,color:TEXT_2,textAlign:'center' }}>{m.solo_miss||0}</span>
              </div>
            ))}
          </div>

          {/* Hit% bar chart */}
          <div style={{ fontSize:9,color:TEXT_3,letterSpacing:'0.1em',padding:'8px 14px 6px' }}>
            HIT PERCENTAGE
          </div>
          <div style={{ margin:'0 14px 12px',background:BG_CARD,borderRadius:10,
            border:`0.5px solid ${GOLD_BORDER}`,padding:'10px 12px' }}>
            {sorted.filter(m=>m.hit_pct!=null).map(m=>(
              <div key={m.manager_id} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
                <span style={{ fontSize:10,color:TEXT_2,width:52,flexShrink:0 }}>{m.display_name}</span>
                <div style={{ flex:1,height:14,borderRadius:7,background:'rgba(255,255,255,0.06)',overflow:'hidden' }}>
                  <div style={{ width:`${m.hit_pct}%`,height:'100%',borderRadius:7,
                    background:m.hit_pct>=50?GREEN:RED,transition:'width 0.4s' }}/>
                </div>
                <span style={{ fontSize:10,fontWeight:600,color:m.hit_pct>=50?GREEN:RED,
                  width:36,textAlign:'right',flexShrink:0 }}>{m.hit_pct}%</span>
              </div>
            ))}
          </div>

          {/* Streak indicators */}
          <div style={{ fontSize:9,color:TEXT_3,letterSpacing:'0.1em',padding:'8px 14px 6px' }}>
            CURRENT STREAKS
          </div>
          <div style={{ margin:'0 14px 12px',background:BG_CARD,borderRadius:10,
            border:`0.5px solid ${GOLD_BORDER}`,overflow:'hidden' }}>
            {parlayStats.map((m,i)=>{
              const s = m.current_streak
              if (!s?.type) return null
              return (
                <div key={m.manager_id} style={{ display:'flex',alignItems:'center',
                  gap:10,padding:'8px 12px',
                  borderBottom:i<parlayStats.length-1?`0.5px solid rgba(212,168,67,0.06)`:'none' }}>
                  <Avatar managerId={m.manager_id} size={24}/>
                  <span style={{ fontSize:12,color:TEXT_1,flex:1 }}>{m.display_name}</span>
                  <div style={{ display:'flex',alignItems:'center',gap:4 }}>
                    {Array(Math.min(s.count,8)).fill(null).map((_,j)=>(
                      <div key={j} style={{ width:8,height:8,borderRadius:'50%',
                        background:s.type==='hit'?GREEN:RED }}/>
                    ))}
                    <span style={{ fontSize:10,fontWeight:600,marginLeft:4,
                      color:s.type==='hit'?GREEN:RED }}>{s.type}{s.count}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Water bet table */}
          {wbStats.some(m=>m.as_submitter.total>0||m.as_opponent.total>0) && (
            <>
              <div style={{ fontSize:9,color:TEXT_3,letterSpacing:'0.1em',padding:'8px 14px 6px' }}>
                WATER BET RECORD
              </div>
              <div style={{ margin:'0 14px 16px',background:BG_CARD,borderRadius:10,
                border:`0.5px solid ${GOLD_BORDER}`,overflow:'hidden' }}>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 80px 80px',
                  padding:'6px 12px',borderBottom:`0.5px solid ${GOLD_BORDER}` }}>
                  {['Manager','As Submitter','As Opponent'].map(h=>(
                    <span key={h} style={{ fontSize:8,color:TEXT_3 }}>{h}</span>
                  ))}
                </div>
                {wbStats.filter(m=>m.as_submitter.total>0||m.as_opponent.total>0).map((m,i,arr)=>(
                  <div key={m.manager_id} style={{ display:'grid',
                    gridTemplateColumns:'1fr 80px 80px',padding:'8px 12px',alignItems:'center',
                    borderBottom:i<arr.length-1?`0.5px solid rgba(212,168,67,0.06)`:'none' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                      <Avatar managerId={m.manager_id} size={20}/>
                      <span style={{ fontSize:11,color:TEXT_1 }}>{m.display_name}</span>
                    </div>
                    <span style={{ fontSize:11,color:TEXT_2 }}>
                      {m.as_submitter.wins}W–{m.as_submitter.losses}L
                    </span>
                    <span style={{ fontSize:11,color:TEXT_2 }}>
                      {m.as_opponent.wins}W–{m.as_opponent.losses}L
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

// ── OVERALL ───────────────────────────────────────────────────────────────────
function OverallTab() {
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/betting/overall`)
      .then(r=>r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding:40,textAlign:'center',color:TEXT_3,fontSize:12 }}>Loading…</div>
  if (!data) return null

  const parlayStats = data.parlay_stats || []
  const wbStats     = data.water_bet_stats || []

  // Top 5 most used players — aggregate from weeks
  const playerUsage = {}
  const playerHits  = {}
  ;(data.player_stats||[]).forEach(p => {
    playerUsage[p.player_name] = (playerUsage[p.player_name]||0) + 1
    if (p.result === 'hit') playerHits[p.player_name] = (playerHits[p.player_name]||0) + 1
  })
  const top5Used = Object.entries(playerUsage).sort((a,b)=>b[1]-a[1]).slice(0,5)
  const top5Hits = Object.entries(playerHits).sort((a,b)=>b[1]-a[1]).slice(0,5)

  return (
    <div style={{ flex:1,overflowY:'auto',paddingBottom:16 }}>
      <div style={{ fontSize:9,color:TEXT_3,letterSpacing:'0.1em',padding:'12px 14px 6px' }}>
        ALL-TIME PARLAY STANDINGS
      </div>
      <div style={{ margin:'0 14px 12px',background:BG_CARD,borderRadius:10,
        border:`0.5px solid ${GOLD_BORDER}`,overflow:'hidden' }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 36px 36px 36px 52px 52px 52px 48px',
          padding:'6px 12px',borderBottom:`0.5px solid ${GOLD_BORDER}`,
          background:'rgba(212,168,67,0.04)' }}>
          {['Manager','W','L','NL','Win%','SoloH','SoloM','Szns'].map((h,i)=>(
            <span key={h} style={{ fontSize:8,color:TEXT_3,textAlign:i>0?'center':'left' }}>{h}</span>
          ))}
        </div>
        {parlayStats.map((m,i)=>(
          <div key={m.manager_id} style={{ display:'grid',
            gridTemplateColumns:'1fr 36px 36px 36px 52px 52px 52px 48px',
            padding:'8px 12px',alignItems:'center',
            borderBottom:i<parlayStats.length-1?`0.5px solid rgba(212,168,67,0.06)`:'none' }}>
            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
              <Avatar managerId={m.manager_id} size={20}/>
              <span style={{ fontSize:10,color:TEXT_1,fontWeight:500 }}>{m.display_name}</span>
            </div>
            <span style={{ fontSize:10,color:GREEN,textAlign:'center' }}>{m.total_hit||0}</span>
            <span style={{ fontSize:10,color:RED,textAlign:'center' }}>{m.total_miss||0}</span>
            <span style={{ fontSize:10,color:TEXT_3,textAlign:'center' }}>{m.total_no_leg||0}</span>
            <span style={{ fontSize:11,fontWeight:600,color:GOLD,textAlign:'center' }}>
              {m.hit_pct!=null?`${m.hit_pct}%`:'—'}
            </span>
            <span style={{ fontSize:10,color:TEXT_2,textAlign:'center' }}>{m.solo_hit||0}</span>
            <span style={{ fontSize:10,color:TEXT_2,textAlign:'center' }}>{m.solo_miss||0}</span>
            <span style={{ fontSize:10,color:TEXT_3,textAlign:'center' }}>{m.seasons||0}</span>
          </div>
        ))}
      </div>

      {/* All-time hit% chart */}
      <div style={{ fontSize:9,color:TEXT_3,letterSpacing:'0.1em',padding:'8px 14px 6px' }}>
        ALL-TIME HIT PERCENTAGE
      </div>
      <div style={{ margin:'0 14px 12px',background:BG_CARD,borderRadius:10,
        border:`0.5px solid ${GOLD_BORDER}`,padding:'10px 12px' }}>
        {parlayStats.filter(m=>m.hit_pct!=null).map(m=>(
          <div key={m.manager_id} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
            <span style={{ fontSize:10,color:TEXT_2,width:52,flexShrink:0 }}>{m.display_name}</span>
            <div style={{ flex:1,height:14,borderRadius:7,background:'rgba(255,255,255,0.06)',overflow:'hidden' }}>
              <div style={{ width:`${m.hit_pct}%`,height:'100%',borderRadius:7,
                background:m.hit_pct>=50?GREEN:RED }}/>
            </div>
            <span style={{ fontSize:10,fontWeight:600,color:m.hit_pct>=50?GREEN:RED,
              width:36,textAlign:'right',flexShrink:0 }}>{m.hit_pct}%</span>
          </div>
        ))}
      </div>

      {/* Water bet all-time */}
      <div style={{ fontSize:9,color:TEXT_3,letterSpacing:'0.1em',padding:'8px 14px 6px' }}>
        ALL-TIME WATER BET RECORD
      </div>
      <div style={{ margin:'0 14px 12px',background:BG_CARD,borderRadius:10,
        border:`0.5px solid ${GOLD_BORDER}`,overflow:'hidden' }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 80px 80px',
          padding:'6px 12px',borderBottom:`0.5px solid ${GOLD_BORDER}` }}>
          {['Manager','As Submitter','As Opponent'].map(h=>(
            <span key={h} style={{ fontSize:8,color:TEXT_3 }}>{h}</span>
          ))}
        </div>
        {wbStats.filter(m=>m.as_submitter.total>0||m.as_opponent.total>0).map((m,i,arr)=>(
          <div key={m.manager_id} style={{ display:'grid',
            gridTemplateColumns:'1fr 80px 80px',padding:'8px 12px',alignItems:'center',
            borderBottom:i<arr.length-1?`0.5px solid rgba(212,168,67,0.06)`:'none' }}>
            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
              <Avatar managerId={m.manager_id} size={20}/>
              <span style={{ fontSize:11,color:TEXT_1 }}>{m.display_name}</span>
            </div>
            <span style={{ fontSize:11,color:TEXT_2 }}>
              {m.as_submitter.wins}W–{m.as_submitter.losses}L
            </span>
            <span style={{ fontSize:11,color:TEXT_2 }}>
              {m.as_opponent.wins}W–{m.as_opponent.losses}L
            </span>
          </div>
        ))}
      </div>

      {/* Top 5 players used */}
      {top5Used.length > 0 && (
        <>
          <div style={{ fontSize:9,color:TEXT_3,letterSpacing:'0.1em',padding:'8px 14px 6px' }}>
            TOP 5 MOST USED PLAYERS
          </div>
          <div style={{ margin:'0 14px 12px',background:BG_CARD,borderRadius:10,
            border:`0.5px solid ${GOLD_BORDER}`,overflow:'hidden' }}>
            {top5Used.map(([name,count],i)=>(
              <div key={name} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'9px 14px',borderBottom:i<top5Used.length-1?`0.5px solid rgba(212,168,67,0.06)`:'none' }}>
                <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                  <span style={{ fontSize:11,color:TEXT_3,width:18,textAlign:'right' }}>{i+1}</span>
                  <span style={{ fontSize:12,color:TEXT_1 }}>{name}</span>
                </div>
                <span style={{ fontSize:12,fontWeight:500,color:GOLD }}>{count}×</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Top 5 players that hit */}
      {top5Hits.length > 0 && (
        <>
          <div style={{ fontSize:9,color:TEXT_3,letterSpacing:'0.1em',padding:'8px 14px 6px' }}>
            TOP 5 PLAYERS BY HITS
          </div>
          <div style={{ margin:'0 14px 16px',background:BG_CARD,borderRadius:10,
            border:`0.5px solid ${GOLD_BORDER}`,overflow:'hidden' }}>
            {top5Hits.map(([name,count],i)=>(
              <div key={name} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'9px 14px',borderBottom:i<top5Hits.length-1?`0.5px solid rgba(212,168,67,0.06)`:'none' }}>
                <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                  <span style={{ fontSize:11,color:TEXT_3,width:18,textAlign:'right' }}>{i+1}</span>
                  <span style={{ fontSize:12,color:TEXT_1 }}>{name}</span>
                </div>
                <span style={{ fontSize:12,fontWeight:500,color:GREEN }}>{count} hits</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Bottom nav ────────────────────────────────────────────────────────────────
function BettingBottomNav({ active, onTab }) {
  return (
    <div style={{ display:'flex',alignItems:'center',flexShrink:0,height:72,
      background:BG_SURFACE,borderTop:`0.5px solid rgba(212,168,67,0.45)`,
      padding:'0 6px',paddingBottom:'env(safe-area-inset-bottom,0px)' }}>
      {BOTTOM_TABS.map(tab => {
        const isActive = active === tab.key
        return (
          <button key={tab.key} onClick={() => onTab(tab.key)}
            className="flex flex-col items-center gap-1" style={{ flex:1 }}>
            <img src={tab.icon} alt={tab.label}
              style={{ width:36,height:36,objectFit:'contain',opacity:isActive?1:0.35 }}/>
            <span style={{ fontSize:7,letterSpacing:'0.06em',textTransform:'uppercase',
              color:isActive?GOLD:TEXT_3 }}>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function BettingScreen({ currentUser }) {
  const location = useLocation()
  const navigate = useNavigate()

  const getTab = () => {
    if (location.pathname.includes('water-bets')) return 'water-bets'
    if (location.pathname.includes('season'))     return 'season'
    if (location.pathname.includes('overall'))    return 'overall'
    return 'parlays'
  }
  const [activeTab, setActiveTab] = useState(getTab())

  const handleTab = (tab) => {
    setActiveTab(tab)
    navigate(`/betting/${tab}`)
  }

  return (
    <div style={{ flex:1,display:'flex',flexDirection:'column',overflow:'hidden' }}>
      <div style={{ flex:1,overflowY:'auto',display:'flex',flexDirection:'column' }}>
        {activeTab === 'parlays'    && <ParlaysTab    currentUser={currentUser}/>}
        {activeTab === 'water-bets' && <WaterBetsTab  currentUser={currentUser}/>}
        {activeTab === 'season'     && <SeasonTab     currentUser={currentUser}/>}
        {activeTab === 'overall'    && <OverallTab    currentUser={currentUser}/>}
      </div>
      <BettingBottomNav active={activeTab} onTab={handleTab}/>
    </div>
  )
}