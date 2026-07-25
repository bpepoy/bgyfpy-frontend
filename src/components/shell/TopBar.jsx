// src/components/shell/TopBar.jsx
export default function TopBar({ section = 'Fantasy', onHamburger, onSettings }) {
  return (
    <div
      className="flex items-center justify-between px-3 flex-shrink-0"
      style={{
        height:       50,
        background:   'var(--bg-surface)',
        borderBottom: '0.5px solid var(--gold-border)',
      }}
    >
      <button
        onClick={onHamburger}
        aria-label="Open menu"
        className="flex items-center justify-center rounded-lg"
      >
        <img src="/icons/hamburger-icon.png" alt="Menu"
          style={{ width: 24, height: 24, objectFit: 'contain' }} />
      </button>

      <div className="text-center">
        <div
          className="font-medium tracking-widest uppercase"
          style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: '0.07em' }}
        >
          {section}
        </div>
        <div
          className="uppercase tracking-widest"
          style={{ fontSize: 7, color: 'var(--text-3)', letterSpacing: '0.14em', marginTop: 1 }}
        >
          BlackGold
        </div>
      </div>

      <button
        onClick={onSettings}
        aria-label="Open settings"
        className="flex items-center justify-center rounded-lg"
      >
        <img src="/icons/settings-icon.png" alt="Settings"
          style={{ width: 24, height: 24, objectFit: 'contain' }} />
      </button>
    </div>
  )
}