// src/components/ui/LoadingSpinner.jsx

export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3" style={{ flex: 1 }}>
      <div
        className="rounded-full"
        style={{
          width:  28,
          height: 28,
          border: '2px solid var(--gold-border)',
          borderTopColor: 'var(--gold)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
