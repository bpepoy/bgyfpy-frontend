// src/components/shell/SettingsMenu.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'https://bgyfpy-backend.onrender.com'

const SETTINGS_ITEMS = [
  { key:'profile',      label:'PROFILE',          icon:'/icons/profile-icon.png'           },
  { key:'upload',       label:'UPLOAD',            icon:'/icons/upload-icon.png'            },
  { key:'proposal',     label:'RULE PROPOSAL',     icon:'/icons/rule-proposal-icon.png'     },
  { key:'voting',       label:'VOTING',            icon:'/icons/voting-icon.png'            },
  { key:'notification', label:'PUSH NOTIFICATION', icon:'/icons/push-notification-icon.png' },
  { key:'refresh',      label:'REFRESH DATA',      icon:'/icons/refresh-data-icon.png'      },
]

export default function SettingsMenu({ open, onClose, currentUser }) {
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)

  // Fetch pending vote count when menu opens
  useEffect(() => {
    if (!open || !currentUser?.manager_id) return
    fetch(`${API}/settings/proposals/pending-count?manager_id=${currentUser.manager_id}`)
      .then(r => r.json())
      .then(d => setPendingCount(d.count || 0))
      .catch(() => setPendingCount(0))
  }, [open, currentUser?.manager_id])

  const handleNav = (key) => {
    navigate(`/settings/${key}`)
    onClose()
  }

  return (
    <>
      {open && (
        <div onClick={onClose} style={{
          position:'fixed', inset:0,
          background:'rgba(0,0,0,0.6)', zIndex:40,
        }}/>
      )}

      <div style={{
        position:'fixed', top:0, right:0, bottom:0, width:220,
        background:'#111111',
        borderLeft:'0.5px solid var(--gold-border)',
        zIndex:50,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform 0.25s ease',
        display:'flex', flexDirection:'column',
      }}>
        {/* Header */}
        <div style={{
          padding:'16px 16px 12px',
          borderBottom:'0.5px solid var(--gold-border)',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <span style={{
            fontSize:13, fontWeight:500,
            color:'var(--gold)', letterSpacing:'0.1em',
          }}>SETTINGS</span>
          <button onClick={onClose} style={{
            background:'none', border:'none',
            color:'var(--text-2)', fontSize:20,
            cursor:'pointer', padding:4,
          }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 0' }}>
          {SETTINGS_ITEMS.map(item => {
            const showBadge = item.key === 'voting' && pendingCount > 0

            return (
              <div key={item.key} onClick={() => handleNav(item.key)}
                style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'12px 18px', cursor:'pointer',
                  position:'relative',
                }}>
                {/* Icon with badge */}
                <div style={{ position:'relative', flexShrink:0 }}>
                  <img src={item.icon} alt={item.label}
                    style={{ width:28, height:28, objectFit:'contain', opacity:0.8 }}/>
                  {showBadge && (
                    <div style={{
                      position:'absolute', top:-6, right:-6,
                      width:16, height:16, borderRadius:'50%',
                      background:'#CF5F5F',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:9, fontWeight:700, color:'white',
                      border:'1.5px solid #111111',
                    }}>
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </div>
                  )}
                </div>

                <span style={{
                  fontSize:11, fontWeight:500,
                  color:'var(--text-1)', letterSpacing:'0.08em',
                }}>
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}