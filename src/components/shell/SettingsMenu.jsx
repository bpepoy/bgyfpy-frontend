// src/components/shell/SettingsMenu.jsx
import { useNavigate } from 'react-router-dom'

const SETTINGS_ITEMS = [
  { key:'profile',      label:'PROFILE',          icon:'/icons/profile-icon.png'           },
  { key:'upload',       label:'UPLOAD',            icon:'/icons/upload-icon.png'            },
  { key:'proposal',     label:'RULE PROPOSAL',     icon:'/icons/rule-proposal-icon.png'     },
  { key:'voting',       label:'VOTING',            icon:'/icons/voting-icon.png'            },
  { key:'notification', label:'PUSH NOTIFICATION', icon:'/icons/push-notification-icon.png' },
  { key:'refresh',      label:'REFRESH DATA',      icon:'/icons/refresh-data-icon.png'      },
]

export default function SettingsMenu({ open, onClose }) {
  const navigate = useNavigate()

  const handleNav = (key) => {
    navigate(`/settings/${key}`)
    onClose()
  }

  return (
    <>
      {open && (
        <div onClick={onClose} style={{ position:'fixed', inset:0,
          background:'rgba(0,0,0,0.6)', zIndex:40 }}/>
      )}
      <div style={{
        position:'fixed', top:0, right:0, bottom:0, width:220,
        background:'#111111', borderLeft:'0.5px solid var(--gold-border)',
        zIndex:50, transform:open?'translateX(0)':'translateX(100%)',
        transition:'transform 0.25s ease', display:'flex', flexDirection:'column',
      }}>
        <div style={{ padding:'16px 16px 12px',
          borderBottom:'0.5px solid var(--gold-border)',
          display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, fontWeight:500,
            color:'var(--gold)', letterSpacing:'0.1em' }}>SETTINGS</span>
          <button onClick={onClose} style={{ background:'none', border:'none',
            color:'var(--text-2)', fontSize:20, cursor:'pointer', padding:4 }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'12px 0' }}>
          {SETTINGS_ITEMS.map(item => (
            <div key={item.key} onClick={() => handleNav(item.key)}
              style={{ display:'flex', alignItems:'center', gap:12,
                padding:'12px 18px', cursor:'pointer' }}>
              <img src={item.icon} alt={item.label}
                style={{ width:36, height:36, objectFit:'contain', opacity:0.8 }}/>
              <span style={{ fontSize:11, fontWeight:500,
                color:'var(--text-1)', letterSpacing:'0.08em' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}