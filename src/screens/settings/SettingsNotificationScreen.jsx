// src/screens/settings/SettingsNotificationScreen.jsx
import { useState, useEffect } from 'react'

const API         = 'https://bgyfpy-backend.onrender.com'
const GOLD        = '#D4A843'
const GOLD_DIM    = 'rgba(212,168,67,0.15)'
const GOLD_BORDER = 'rgba(212,168,67,0.3)'
const BG_CARD     = '#1e1e1e'
const TEXT_1      = '#F0E6CC'
const TEXT_2      = '#A89060'
const TEXT_3      = '#5A4828'
const GREEN       = '#5DBF6A'
const RED         = '#CF5F5F'

// Brian and Zef can send notifications
const ALLOWED = ['brian', 'zef']

export default function SettingsNotificationScreen({ onBack, currentUser }) {
  const [user, setUser] = useState(currentUser)
  const canSend     = ALLOWED.includes(user.manager_id)

  const [message,   setMessage]   = useState('')
  const [sending,   setSending]   = useState(false)
  const [status,    setStatus]    = useState(null)
  const [history,   setHistory]   = useState([])
  const [loadingH,  setLoadingH]  = useState(false)

  useEffect(() => {
    setLoadingH(true)
    fetch(`${API}/settings/notifications?limit=20`)
      .then(r => r.json())
      .then(d => { setHistory(d.notifications||[]); setLoadingH(false) })
      .catch(() => setLoadingH(false))
  }, [])

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    setStatus(null)
    try {
      await fetch(`${API}/settings/notifications/send`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ sent_by:user.manager_id, message:message.trim() })
      })
      setStatus({ type:'success', msg:'Notification sent!' })
      setMessage('')
      // Refresh history
      fetch(`${API}/settings/notifications?limit=20`)
        .then(r=>r.json())
        .then(d=>setHistory(d.notifications||[]))
    } catch(e) {
      setStatus({ type:'error', msg:'Failed to send. Please try again.' })
    } finally { setSending(false) }
  }

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column',
      background:'#0f0f0f', overflowY:'auto' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12,
        padding:'14px 16px', borderBottom:`0.5px solid ${GOLD_BORDER}`,
        background:'#171717', flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:'none',
          color:TEXT_2, fontSize:22, cursor:'pointer', padding:'0 4px' }}>‹</button>
        <div style={{ fontSize:13, fontWeight:500, color:GOLD, letterSpacing:'0.08em' }}>
          PUSH NOTIFICATION
        </div>
      </div>

      <div style={{ padding:'16px', paddingBottom:32 }}>
        {canSend ? (
          <>
            <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:20,
              background:BG_CARD, border:`0.5px solid rgba(255,255,255,0.06)`,
              fontSize:11, color:TEXT_3, lineHeight:1.6 }}>
              Send a push notification to all BlackGold members.
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em',
                textTransform:'uppercase', marginBottom:8 }}>Message</div>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Type your notification message…"
                rows={4}
                style={{ width:'100%', padding:'10px 12px', borderRadius:10,
                  border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
                  color:TEXT_1, fontSize:13, resize:'none', boxSizing:'border-box',
                  fontFamily:'inherit', lineHeight:1.6 }}/>
              <div style={{ fontSize:9, color:TEXT_3, textAlign:'right', marginTop:4 }}>
                {message.length} chars
              </div>
            </div>

            {status && (
              <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:16,
                background:status.type==='success'?'rgba(93,191,106,0.1)':'rgba(207,95,95,0.1)',
                border:`0.5px solid ${status.type==='success'?'rgba(93,191,106,0.3)':'rgba(207,95,95,0.3)'}`,
                fontSize:12, color:status.type==='success'?GREEN:RED }}>
                {status.msg}
              </div>
            )}

            <button onClick={handleSend}
              disabled={!message.trim() || sending}
              style={{ width:'100%', padding:'14px', borderRadius:12, border:'none',
                cursor:message&&!sending?'pointer':'default',
                background:message&&!sending?GOLD_DIM:'rgba(255,255,255,0.04)',
                borderWidth:1, borderStyle:'solid',
                borderColor:message&&!sending?GOLD:'rgba(255,255,255,0.08)',
                fontSize:13, fontWeight:600,
                color:message&&!sending?GOLD:TEXT_3, marginBottom:24 }}>
              {sending ? 'Sending…' : '🔔 Send Notification'}
            </button>
          </>
        ) : (
          <div style={{ padding:40, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:12 }}>🔒</div>
            <div style={{ fontSize:13, color:TEXT_3 }}>
              Only Brian and Zef can send notifications.
            </div>
          </div>
        )}

        {/* History */}
        <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em',
          textTransform:'uppercase', marginBottom:10 }}>
          Recent Notifications
        </div>
        {loadingH ? (
          <div style={{ fontSize:12, color:TEXT_3, textAlign:'center', padding:20 }}>
            Loading…
          </div>
        ) : history.length === 0 ? (
          <div style={{ fontSize:12, color:TEXT_3, textAlign:'center', padding:20 }}>
            No notifications sent yet.
          </div>
        ) : history.map((n, i) => (
          <div key={n.id||i} style={{ padding:'10px 14px', borderRadius:10,
            background:BG_CARD, border:`0.5px solid rgba(255,255,255,0.06)`,
            marginBottom:8 }}>
            <div style={{ fontSize:12, color:TEXT_1, lineHeight:1.5, marginBottom:4 }}>
              {n.message}
            </div>
            <div style={{ fontSize:9, color:TEXT_3 }}>
              Sent by {n.sent_by} · {n.sent_at?.slice(0,10)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}