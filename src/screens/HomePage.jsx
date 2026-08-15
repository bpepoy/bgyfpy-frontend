import { useState, useEffect } from "react"

const API = "https://bgyfpy-backend.onrender.com"

const GOLD = "#D4A843"
const GOLD_DIM = "rgba(212,168,67,0.18)"
const GOLD_BORDER = "rgba(212,168,67,0.3)"
const BG_CARD = "#1e1e1e"
const TEXT_PRIMARY = "#F0E6CC"
const TEXT_SEC = "#A89060"
const TEXT_MUTED = "#5A4828"
const GREEN = "#5DBF6A"
const RED = "#CF5F5F"

const INITIALS = {
  blake:"BJ", brian:"BP", frank:"FL", jake:"JK",
  joey:"JY", jordan:"JM", kyle:"KB", nick:"ND", rob:"RD", zef:"ZD"
}

function Avatar({ managerId, photoUrl, size = 44, borderColor = GOLD }) {
  const initials = INITIALS[managerId] || managerId?.slice(0,2).toUpperCase() || "?"
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      border:`1.5px solid ${borderColor}`,
      overflow:"hidden", flexShrink:0,
      display:"flex", alignItems:"center", justifyContent:"center",
      background: photoUrl ? "transparent" : GOLD_DIM,
      fontSize:size*0.28, fontWeight:500,
      color:GOLD, letterSpacing:"0.04em",
    }}>
      {photoUrl
        ? <img src={photoUrl} alt={managerId}
            style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        : initials
      }
    </div>
  )
}

function StatTile({ label, value, sub }) {
  return (
    <div style={{
      flex:1, borderRadius:10,
      padding:"12px 8px", textAlign:"center",
    }}>
      <div style={{
        fontSize:8, color:TEXT_MUTED, letterSpacing:"0.08em",
        textTransform:"uppercase", marginBottom:6, whiteSpace:"nowrap",
      }}>{label}</div>
      <div style={{fontSize:22, fontWeight:500, color:GOLD, lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:8, color:TEXT_MUTED, marginTop:4}}>{sub}</div>}
    </div>
  )
}

function ManagerCard({ data, type, punishment }) {
  if (!data) return null
  const isChamp = type === "champion"
  const borderCol = isChamp ? GOLD : RED
  const accentCol = isChamp ? GOLD : RED
  const label = isChamp ? "2025 CHAMPION" : "2025 LAST PLACE"
  const icon  = isChamp ? "🏆" : "💀"
  const wins   = data.wins   ?? 0
  const losses = data.losses ?? 0
  const ties   = data.ties   ?? 0
  const record = ties > 0
    ? `${wins}–${losses}–${ties}`
    : `${wins}–${losses}`
  const games = wins + losses + ties
  const ptsPerWk = data.points_for && games
    ? (data.points_for / games).toFixed(1) + " pts/wk"
    : null

  return (
    <div style={{
      background:BG_CARD, borderRadius:12,
      border:`0.5px solid rgba(212,168,67,0.25)`,
      marginBottom:10, overflow:"hidden",
    }}>
      <div style={{
        fontSize:9, color:accentCol, letterSpacing:"0.12em",
        textTransform:"uppercase", padding:"9px 14px 4px",
        display:"flex", alignItems:"center", gap:5,
      }}>
        <span>{icon}</span>{label}
      </div>
      <div style={{
        padding:"8px 14px 12px",
        display:"flex", alignItems:"center", gap:12,
      }}>
        <Avatar managerId={data.manager_id} photoUrl={data.photo_url}
          size={46} borderColor={borderCol}/>
        <div style={{flex:1}}>
          <div style={{fontSize:19, fontWeight:500, color:TEXT_PRIMARY}}>
            {data.display_name}
          </div>
          <div style={{fontSize:12, color:TEXT_SEC, marginTop:2}}>
            {data.team_name}
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:15, fontWeight:500, color:isChamp ? GREEN : RED}}>
            {record}
          </div>
          {ptsPerWk && (
            <div style={{fontSize:11, color:TEXT_MUTED, marginTop:2}}>{ptsPerWk}</div>
          )}
        </div>
      </div>
      {!isChamp && punishment && (
        <div style={{
          margin:"0 12px 12px", padding:"8px 12px",
          background:"rgba(207,95,95,0.08)",
          border:`0.5px solid rgba(207,95,95,0.25)`,
          borderRadius:8, fontSize:11, color:"#CF7070", lineHeight:1.45,
        }}>
          {punishment}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    fetch(`${API}/home`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(d  => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const snap  = data?.league_snapshot
  const tiles = data?.stat_tiles

  if (loading) return (
    <div style={{
      flex:1, display:"flex", alignItems:"center", justifyContent:"center",
      color:TEXT_MUTED, fontSize:13, letterSpacing:"0.08em",
    }}>
      Loading…
    </div>
  )

  if (error) return (
    <div style={{
      flex:1, display:"flex", alignItems:"center", justifyContent:"center",
      color:RED, fontSize:12, padding:20, textAlign:"center",
    }}>
      Could not load home data: {error}
    </div>
  )

  return (
    <div style={{flex:1, overflowY:"auto", padding:"0 0 16px"}}>

      {/* Hero */}
      <div style={{
        padding:"20px 16px 12px",
        display:"flex", flexDirection:"column",
        alignItems:"center", gap:10,
      }}>
        <img src="/icons/blackgold-logo.png" alt="BlackGold"
          style={{width:130, height:130, borderRadius:18}}/>
        <div style={{textAlign:"center"}}>
          <div style={{
            fontSize:28, fontWeight:500, color:GOLD,
            letterSpacing:"0.06em", lineHeight:1.1,
          }}>BLACKGOLD</div>
          <div style={{
            fontSize:11, color:TEXT_SEC, letterSpacing:"0.18em",
            marginTop:4, textTransform:"uppercase",
          }}>Est. 2007</div>
        </div>
      </div>

      {/* Stat tiles */}
      {tiles && (
        <div style={{display:"flex", gap:10, padding:"0 14px", marginBottom:14}}>
          <StatTile
            label="Total Seasons"
            value={tiles.total_seasons}
            sub={tiles.years_active}
          />
          <StatTile
            label="Total Games"
            value={tiles.total_games?.toLocaleString()}
            sub="all time"
          />
          <StatTile
            label="Total Points"
            value={tiles.total_points?.toLocaleString()}
            sub="all time"
          />
        </div>
      )}

      {/* Manager cards */}
      <div style={{padding:"0 14px"}}>
        <ManagerCard data={snap?.champion}  type="champion"/>
        <ManagerCard
          data={snap?.last_place}
          type="last_place"
          punishment={snap?.last_place?.punishment}
        />
      </div>

    </div>
  )
}