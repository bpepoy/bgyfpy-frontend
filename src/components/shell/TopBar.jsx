// src/components/shell/TopBar.jsx
import { useState, useEffect } from 'react'

export default function TopBar({ section = 'Fantasy', onHamburger, onSettings, currentUser }) {
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!currentUser?.manager_id) return
    fetch(`https://bgyfpy-backend.onrender.com/settings/proposals/pending-count?manager_id=${currentUser.manager_id}`)
      .then(r => r.json())
      .then(d => setPendingCount(d.count || 0))
      .catch(() => {})
  }, [currentUser?.manager_id])

  return (
    <div
      className="flex items-center justify-between px-3 flex-shrink-0"
      style={{
        height:       50,
        background:   'var(--bg-surface)',
        borderBottom: '0.5px solid var(--gold-border)',
      }}
    >
      <button onClick={onHamburger} aria-label="Open menu"
        className="flex items-center justify-center rounded-lg">
        <img src="/icons/hamburger-icon.png" alt="Menu"
          style={{ width:24, height:24, objectFit:'contain' }}/>
      </button>

      <div className="text-center">
        <div className="font-medium tracking-widest uppercase"
          style={{ fontSize:12, color:'var(--gold)', letterSpacing:'0.07em' }}>
          {section}
        </div>
        <div className="uppercase tracking-widest"
          style={{ fontSize:7, color:'var(--text-3)', letterSpacing:'0.14em', marginTop:1 }}>
          BlackGold
        </div>
      </div>

      <button onClick={onSettings} aria-label="Open settings"
        className="flex items-center justify-center rounded-lg">
        <div style={{ position:'relative' }}>
          <img src="/icons/settings-icon.png" alt="Settings" style={{ width:36, height:36 }}/>
          {pendingCount > 0 && (
            <div style={{
              position:'absolute', top:0, right:0,
              width:8, height:8, borderRadius:'50%',
              background:'#CF5F5F',
              border:'1.5px solid #0f0f0f',
            }}/>
          )}
        </div>
      </button>
    </div>
  )
}