// src/screens/LeagueRecordsTab.jsx
import { useState } from 'react'

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

const POS_COLORS  = { QB:'#E07B54', WR:'#5B9BD5', RB:'#5DBF6A', TE:'#D4A843', DEF:'#888', K:'#A87DC8', 'W/R/T':'#C8A050' }
const ERA_LABELS  = {
  old_scoring_era:    'Old Scoring (2007–2012)',
  era_with_kickers:   'With Kickers (2013–2021)',
  era_no_kicker:      'No Kicker / Current',
}

// ── Shared UI ──────────────────────────────────────────────────────────────────

function SectionLabel({ label }) {
  return (
    <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.12em',
      textTransform:'uppercase', padding:'16px 14px 6px' }}>
      {label}
    </div>
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

function Row({ left, right, sub, last, accent }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'10px 14px',
      borderBottom:last?'none':`0.5px solid rgba(212,168,67,0.08)` }}>
      <div>
        <div style={{ fontSize:13, color:TEXT_1, fontWeight:500 }}>{left}</div>
        {sub && <div style={{ fontSize:10, color:TEXT_2, marginTop:2 }}>{sub}</div>}
      </div>
      <div style={{ fontSize:14, fontWeight:600, color:accent||GOLD, flexShrink:0 }}>{right}</div>
    </div>
  )
}

function PosChip({ pos }) {
  const c = POS_COLORS[pos] || TEXT_3
  return (
    <span style={{ fontSize:8, fontWeight:700, color:c, background:`${c}22`,
      border:`1px solid ${c}44`, borderRadius:4, padding:'2px 6px', flexShrink:0 }}>{pos}</span>
  )
}

function EraToggle({ eras, value, onChange }) {
  return (
    <div style={{ display:'flex', margin:'12px 14px 0', background:BG_CARD,
      borderRadius:10, border:`0.5px solid ${GOLD_BORDER}`, padding:3, gap:3 }}>
      {eras.map(era => (
        <button key={era} onClick={() => onChange(era)}
          style={{ flex:1, padding:'6px 4px', borderRadius:8, border:'none', cursor:'pointer',
            background:value===era?GOLD_DIM:'transparent',
            borderWidth:value===era?1:0, borderStyle:'solid', borderColor:value===era?GOLD:'transparent',
            fontSize:8, letterSpacing:'0.06em', textTransform:'uppercase',
            color:value===era?GOLD:TEXT_3, fontWeight:value===era?600:400 }}>
          {era==='old_scoring_era'?'Old Era':era==='era_with_kickers'?'W/ Kicker':'Current'}
        </button>
      ))}
    </div>
  )
}

function RankBadge({ rank }) {
  const colors = { 1:GOLD, 2:'#C0C0C0', 3:'#C8845A' }
  const icons  = { 1:'🥇', 2:'🥈', 3:'🥉' }
  return icons[rank]
    ? <span style={{ fontSize:14 }}>{icons[rank]}</span>
    : <span style={{ fontSize:11, color:TEXT_3, minWidth:16, textAlign:'right' }}>{rank}</span>
}

// ── Franchise Records ─────────────────────────────────────────────────────────

function FranchisePair({ left, right, data, last }) {
  const fmt = (key, val) => {
    if (!val && val !== 0) return '—'
    if (key === 'best_win_pct' || key === 'worst_win_pct') return `${(val*100).toFixed(1)}%`
    if (key === 'most_points_career') return `${parseFloat(val).toFixed(0)} pts`
    return val
  }
  const renderSide = (s) => {
    if (!s || !data[s.key]) return (
      <div style={{ flex:1, padding:'8px 10px' }}>
        <div style={{ fontSize:9, color:TEXT_3, marginBottom:2 }}>{s?.icon} {s?.label}</div>
        <div style={{ fontSize:11, color:TEXT_3 }}>—</div>
      </div>
    )
    const holders = data[s.key]
    const first   = holders[0]
    const value   = first.count ?? first.win_pct ?? first.total_pf ?? first.seasons ?? first.wins
    return (
      <div style={{ flex:1, padding:'8px 10px' }}>
        <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.06em', marginBottom:3 }}>
          {s.icon} {s.label}
        </div>
        <div style={{ fontSize:12, fontWeight:500, color:TEXT_1 }}>
          {holders.map(h=>h.display_name).join(', ')}
          {holders.length > 1 && <span style={{ fontSize:8, color:TEXT_3, marginLeft:4 }}>TIED</span>}
        </div>
        <div style={{ fontSize:16, fontWeight:600, color:GOLD, marginTop:2 }}>{fmt(s.key, value)}</div>
      </div>
    )
  }
  return (
    <div style={{ display:'flex', borderBottom:last?'none':`0.5px solid rgba(212,168,67,0.08)` }}>
      {renderSide(left)}
      <div style={{ width:0.5, background:'rgba(212,168,67,0.08)', alignSelf:'stretch' }}/>
      {renderSide(right)}
    </div>
  )
}

function FranchiseRecords({ data }) {
  if (!data) return null
  const pairs = [
    [
      { key:'most_championships',       label:'Most Championships',      icon:'🏆' },
      { key:'most_last_place',          label:'Most Last Place',         icon:'💩' },
    ],[
      { key:'most_regular_season_wins', label:'Most RS Wins',            icon:'📈' },
      { key:'most_playoff_wins',        label:'Most Playoff Wins',       icon:'🏅' },
    ],[
      { key:'most_playoff_appearances', label:'Most Playoff Apps',       icon:'🎯' },
      { key:'most_finals_appearances',  label:'Most Finals Apps',        icon:'⭐' },
    ],[
      { key:'best_win_pct',             label:'Best Win %',              icon:'📊' },
      { key:'most_points_career',       label:'Most Career PF',          icon:'💥' },
    ],
  ]
  return (
    <>
      <SectionLabel label="Franchise Records" />
      <Card>
        {pairs.map((pair, i) => (
          <FranchisePair key={i} left={pair[0]} right={pair[1]} data={data} last={i===pairs.length-1}/>
        ))}
      </Card>
    </>
  )
}

// ── Scoring Records ───────────────────────────────────────────────────────────

function ScoringPairRow({ labelA, labelB, recA, recB, valFn, subFn, last }) {
  const renderCell = (label, rec) => (
    <div style={{ flex:1, padding:'8px 10px' }}>
      <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.06em', marginBottom:3 }}>{label}</div>
      {rec ? <>
        <div style={{ fontSize:11, fontWeight:500, color:TEXT_1 }}>{subFn(rec)}</div>
        <div style={{ fontSize:15, fontWeight:600, color:GOLD, marginTop:2 }}>{valFn(rec)}</div>
      </> : <div style={{ fontSize:11, color:TEXT_3 }}>—</div>}
    </div>
  )
  return (
    <div style={{ display:'flex', borderBottom:last?'none':`0.5px solid rgba(212,168,67,0.08)` }}>
      {renderCell(labelA, recA)}
      <div style={{ width:0.5, background:'rgba(212,168,67,0.08)', alignSelf:'stretch' }}/>
      {renderCell(labelB, recB)}
    </div>
  )
}

function ScoringRecords({ data }) {
  if (!data) return null
  const eras = Object.keys(data)
  const [era, setEra] = useState(eras[eras.length-1])
  const d = data[era] || {}

  const ptsVal = r => `${r.avg_pf ?? r.points ?? r.total_pf} pts${r.avg_pf ? '/g' : ''}`
  const seaSub = r => `${r.display_name} · ${r.year}`
  const wkSub  = r => `${r.display_name} · ${r.year} Wk ${r.week}`

  return (
    <>
      <SectionLabel label="Scoring Records" />
      <EraToggle eras={eras} value={era} onChange={setEra}/>
      <div style={{ fontSize:9, color:TEXT_3, padding:'4px 14px 2px', letterSpacing:'0.08em' }}>
        {ERA_LABELS[era]}
      </div>

      {/* Season section */}
      <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', padding:'8px 14px 4px' }}>SEASON</div>
      <Card>
        <ScoringPairRow
          labelA="🔝 Best Season Avg" labelB="📉 Worst Season Avg"
          recA={d.top_season_pf_avg?.[0]} recB={d.bottom_season_pf_avg?.[0]}
          valFn={r=>`${r.avg_pf} pts/g`} subFn={seaSub}/>
        <ScoringPairRow
          labelA="🛡️ Best PA Avg" labelB="😬 Worst PA Avg"
          recA={d.top_season_pa_avg?.[0]} recB={d.bottom_season_pa_avg?.[0]}
          valFn={r=>`${r.avg_pa} pts/g`} subFn={seaSub} last/>
      </Card>

      {/* Weekly section */}
      <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', padding:'8px 14px 4px' }}>WEEKLY</div>
      <Card>
        <ScoringPairRow
          labelA="🔥 Highest Week" labelB="🥶 Lowest Week"
          recA={d.highest_weekly_pf?.[0]} recB={d.lowest_weekly_pf?.[0]}
          valFn={r=>`${r.points} pts`} subFn={wkSub}/>
        <ScoringPairRow
          labelA="🏆 Highest Playoff Wk" labelB="💀 Lowest Playoff Wk"
          recA={d.highest_playoff_pf?.[0]} recB={d.lowest_playoff_pf?.[0]}
          valFn={r=>`${r.points} pts`} subFn={wkSub} last/>
      </Card>
    </>
  )
}

// ── Position Records ──────────────────────────────────────────────────────────

function PositionRecords({ data }) {
  if (!data) return null
  const eras = Object.keys(data)
  const [era, setEra] = useState(eras[eras.length-1])
  const eraData = data[era] || {}
  const positions = ['QB','WR','RB','TE','DEF','K'].filter(p =>
    eraData.best_week?.[p] || eraData.best_season?.[p]
  )

  return (
    <>
      <SectionLabel label="Position Records" />
      <EraToggle eras={eras} value={era} onChange={setEra}/>
      <div style={{ fontSize:9, color:TEXT_3, padding:'6px 14px 2px', letterSpacing:'0.08em' }}>
        {ERA_LABELS[era]}
      </div>

      {/* Best Week */}
      {eraData.best_week && (
        <>
          <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', padding:'10px 14px 4px' }}>
            BEST SINGLE WEEK
          </div>
          <Card>
            {positions.filter(p => eraData.best_week[p]).map((pos, i, arr) => {
              const r = eraData.best_week[pos]
              return (
                <div key={pos} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                  borderBottom:i<arr.length-1?`0.5px solid rgba(212,168,67,0.08)`:'none' }}>
                  <PosChip pos={pos}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:TEXT_1 }}>{r.player_name}</div>
                    <div style={{ fontSize:9, color:TEXT_2 }}>
                      {r.display_name} · {r.nfl_team} · {r.year} Wk {r.week}
                    </div>
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, color:GOLD }}>{r.points}</div>
                </div>
              )
            })}
          </Card>
        </>
      )}

      {/* Best Season */}
      {eraData.best_season && (
        <>
          <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', padding:'10px 14px 4px' }}>
            BEST SEASON TOTAL
          </div>
          <Card>
            {positions.filter(p => eraData.best_season?.[p]).map((pos, i, arr) => {
              const r = eraData.best_season[pos]
              return (
                <div key={pos} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                  borderBottom:i<arr.length-1?`0.5px solid rgba(212,168,67,0.08)`:'none' }}>
                  <PosChip pos={pos}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:TEXT_1 }}>{r.player_name}</div>
                    <div style={{ fontSize:9, color:TEXT_2 }}>
                      {r.display_name} · {r.nfl_team} · {r.year}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:14, fontWeight:600, color:GOLD }}>{r.season_pts ?? r.total_pts ?? r.points}</div>
                    <div style={{ fontSize:8, color:TEXT_3 }}>pts</div>
                  </div>
                </div>
              )
            })}
          </Card>
        </>
      )}
    </>
  )
}

// ── Draft Records ─────────────────────────────────────────────────────────────

function DraftRecords({ data }) {
  if (!data) return null
  const [expanded, setExpanded] = useState(null)

  return (
    <>
      <SectionLabel label="Draft Records" />

      {/* Most drafted players by position */}
      {data.most_drafted_players && (
        <>
          <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', padding:'6px 14px 4px' }}>
            MOST DRAFTED PLAYERS
          </div>
          {Object.entries(data.most_drafted_players).map(([pos, players]) => (
            <Card key={pos}>
              <div style={{ padding:'8px 14px 4px', fontSize:9, color:TEXT_3 }}>
                <PosChip pos={pos}/> {pos}
              </div>
              {(players||[]).slice(0,3).map((p, i, arr) => (
                <div key={p.player_name} style={{ padding:'8px 14px',
                  borderBottom:i<arr.length-1?`0.5px solid rgba(212,168,67,0.08)`:'none' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:500, color:TEXT_1 }}>{p.player_name}</div>
                      <div style={{ fontSize:9, color:TEXT_3, marginTop:2 }}>
                        {p.years?.slice(0,5).join(', ')}{p.years?.length>5?'…':''}
                      </div>
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, color:GOLD }}>{p.times_drafted}×</div>
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </>
      )}

      {/* Biggest auction costs */}
      {data.biggest_auction_costs?.length > 0 && (
        <>
          <SectionLabel label="Biggest Auction Bids" />
          <Card>
            {data.biggest_auction_costs.slice(0,10).map((p, i, arr) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px',
                borderBottom:i<arr.length-1?`0.5px solid rgba(212,168,67,0.08)`:'none' }}>
                <span style={{ fontSize:11, color:TEXT_3, width:18, textAlign:'right' }}>{i+1}</span>
                <PosChip pos={p.position}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:TEXT_1 }}>{p.player_name}</div>
                  <div style={{ fontSize:9, color:TEXT_2 }}>{p.display_name} · {p.nfl_team} · {p.year}</div>
                </div>
                <div style={{ fontSize:14, fontWeight:600, color:GOLD }}>${p.cost}</div>
              </div>
            ))}
          </Card>
        </>
      )}
    </>
  )
}

// ── Transaction Records ───────────────────────────────────────────────────────

function TransactionRecords({ data }) {
  if (!data) return null
  return (
    <>
      <SectionLabel label="Transaction Records" />

      {data.biggest_faab_bids?.length > 0 && (
        <>
          <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', padding:'6px 14px 4px' }}>
            BIGGEST FAAB BIDS
          </div>
          <Card>
            {data.biggest_faab_bids.slice(0,10).map((p, i, arr) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px',
                borderBottom:i<arr.length-1?`0.5px solid rgba(212,168,67,0.08)`:'none' }}>
                <span style={{ fontSize:11, color:TEXT_3, width:18, textAlign:'right' }}>{i+1}</span>
                <PosChip pos={p.position}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:TEXT_1 }}>{p.player_name}</div>
                  <div style={{ fontSize:9, color:TEXT_2 }}>{p.display_name} · {p.nfl_team} · {p.year}</div>
                </div>
                <div style={{ fontSize:14, fontWeight:600, color:GOLD }}>${p.bid}</div>
              </div>
            ))}
          </Card>
        </>
      )}

      {data.most_moves_season?.length > 0 && (
        <>
          <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', padding:'10px 14px 4px' }}>
            MOST MOVES IN A SEASON
          </div>
          <Card>
            {data.most_moves_season.slice(0,5).map((r, i, arr) => (
              <Row key={i} left={r.display_name} sub={String(r.year)}
                right={`${r.total_moves} moves`} last={i===arr.length-1}/>
            ))}
          </Card>
        </>
      )}

      {data.most_trades_season?.length > 0 && (
        <>
          <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', padding:'10px 14px 4px' }}>
            MOST TRADES IN A SEASON
          </div>
          <Card>
            {data.most_trades_season.slice(0,5).map((r, i, arr) => (
              <Row key={i} left={r.display_name} sub={String(r.year)}
                right={`${r.trades} trades`} last={i===arr.length-1}/>
            ))}
          </Card>
        </>
      )}
    </>
  )
}

// ── Ice Records ───────────────────────────────────────────────────────────────

function IceRecords({ data }) {
  if (!data) return null
  const sections = [
    { key:'most_real_ices',       label:'Most Ices',          note:true },
    { key:'most_ices_in_season',  label:'Most Ices in a Season' },
    { key:'most_iced_against',    label:'Most Times Iced Against' },
    { key:'highest_ice_pts',      label:'Highest Scoring Ice' },
  ]

  return (
    <>
      <SectionLabel label="Ice Records" />
      {sections.filter(s => data[s.key]).map(s => {
        const d = data[s.key]
        const holders = d.holders || d
        if (!holders?.length) return null
        const first = holders[0]
        return (
          <Card key={s.key}>
            <div style={{ padding:'8px 14px 4px' }}>
              <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.08em', marginBottom:6 }}>
                ❄️ {s.label}
              </div>
              {s.note && d.note && (
                <div style={{ fontSize:9, color:TEXT_3, marginBottom:6, fontStyle:'italic' }}>{d.note}</div>
              )}
              {holders.slice(0,3).map((h, i, arr) => (
                <div key={h.manager_id||i} style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', padding:'6px 0',
                  borderBottom:i<arr.length-1?`0.5px solid rgba(212,168,67,0.06)`:'none' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <RankBadge rank={i+1}/>
                    <span style={{ fontSize:12, color:TEXT_1 }}>{h.display_name}</span>
                    {h.year && <span style={{ fontSize:9, color:TEXT_3 }}>{h.year}</span>}
                  </div>
                  <span style={{ fontSize:13, fontWeight:600, color:GOLD }}>
                    {h.count ?? h.points ?? h.bid}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </>
  )
}

// ── Championship Roster Records ───────────────────────────────────────────────

function ChampionshipRosterRecords({ data }) {
  if (!data) return null

  return (
    <>
      <SectionLabel label="Championship Roster Records" />

      {/* Top 5 players */}
      {data.top_5_players?.length > 0 && (
        <>
          <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', padding:'6px 14px 4px' }}>
            MOST CHAMPIONSHIP APPEARANCES
          </div>
          <Card>
            {data.top_5_players.map((p, i, arr) => {
              const [showDetail, setShowDetail] = useState(false)
              return (
                <div key={p.player_name}>
                  <div onClick={() => setShowDetail(s=>!s)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                      cursor:'pointer',
                      borderBottom:!showDetail&&i<arr.length-1?`0.5px solid rgba(212,168,67,0.08)`:'none' }}>
                    <span style={{ fontSize:11, color:TEXT_3, width:18, textAlign:'right' }}>{i+1}</span>
                    <PosChip pos={p.position}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:500, color:TEXT_1 }}>{p.player_name}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:13, fontWeight:600, color:GOLD }}>{p.championship_appearances}×</div>
                      <div style={{ fontSize:8, color:TEXT_3 }}>{showDetail?'▲':'▼'}</div>
                    </div>
                  </div>
                  {showDetail && (
                    <div style={{ borderBottom:i<arr.length-1?`0.5px solid rgba(212,168,67,0.08)`:'none',
                      padding:'0 14px 10px', background:'rgba(212,168,67,0.03)' }}>
                      {(p.appearances_detail||[]).map((a, j) => (
                        <div key={j} style={{ display:'flex', justifyContent:'space-between',
                          alignItems:'center', padding:'5px 0',
                          borderBottom:j<p.appearances_detail.length-1?`0.5px solid rgba(212,168,67,0.05)`:'none' }}>
                          <span style={{ fontSize:10, color:TEXT_2 }}>{a.year}</span>
                          <span style={{ fontSize:10, color:TEXT_1 }}>{a.display_name}</span>
                          <span style={{ fontSize:9, color:a.slot_type==='starter'?GREEN:TEXT_3 }}>
                            {a.slot_type}
                          </span>
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
    </>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function LeagueRecordsTab({ data }) {
  if (!data) return (
    <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>
      No records data available.
    </div>
  )

  return (
    <div style={{ paddingBottom:24 }}>
      <FranchiseRecords      data={data.franchise_records}          />
      <ScoringRecords        data={data.scoring_records}            />
      <PositionRecords       data={data.position_records}           />
      <DraftRecords          data={data.draft_records}              />
      <TransactionRecords    data={data.transaction_records}        />
      <IceRecords            data={data.ice_records}                />
      <ChampionshipRosterRecords data={data.championship_roster_records}/>
      <div style={{ height:16 }}/>
    </div>
  )
}