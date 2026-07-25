// src/screens/HomeScreen.jsx
import { useApi } from '../hooks/useApi'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Avatar from '../components/Avatar'
import { IconTrophy, IconMoodSad } from '@tabler/icons-react'

function initials(name = '') { return name.slice(0, 2).toUpperCase() }

export default function HomeScreen() {
  const { data, loading, error } = useApi('/home')

  if (loading) return <LoadingSpinner label="Loading BlackGold…" />
  if (error) return (
    <div className="flex items-center justify-center flex-1 p-6">
      <p style={{ color: 'var(--loss)', fontSize: 13, textAlign: 'center' }}>
        Could not reach the server.<br />
        <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{error}</span>
      </p>
    </div>
  )
  if (!data) return null

  const { league_snapshot, stat_tiles } = data
  const { champion, last_place } = league_snapshot || {}

  return (
    <div className="scroll-hide" style={{ flex: 1, overflowY: 'auto', padding: '20px 14px 28px' }}>

      {/* ── Logo + title ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src="/logo.png"
          alt="BlackGold"
          style={{ width: 240, height: 240, objectFit: 'contain', flexShrink: 0 }}
        />
        <div>
          <div style={{
            fontSize: 26, fontWeight: 500, color: 'var(--gold)',
            letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1,
          }}>
            BlackGold
          </div>
          <div style={{
            fontSize: 14, color: 'var(--text-3)',
            letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 6,
          }}>
            Est. 2007
          </div>
        </div>
      </div>

      {/* ── Two stat tiles ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: 'Total seasons',  value: stat_tiles?.total_seasons,  sub: stat_tiles?.years_active },
          { label: 'Active members', value: stat_tiles?.active_members, sub: `${stat_tiles?.num_teams} teams` },
        ].map((tile, i) => (
          <div key={i} className="rounded-xl p-3 text-center"
            style={{ background: 'var(--bg-card)', border: '0.5px solid var(--gold-border)' }}>
            <div style={{ fontSize: 14, color: 'var(--text-3)', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 4 }}>{tile.label}</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--gold)', lineHeight: 1 }}>
              {tile.value ?? '—'}
            </div>
          </div>
        ))}
      </div>

      {/* ── Champion ─────────────────────────────────────────────────────── */}
      {champion && (
        <div className="rounded-xl p-4 mb-3"
          style={{ background: 'var(--bg-card)', border: '0.5px solid var(--gold-strong)' }}>
          <div className="flex items-center gap-1 mb-3">
            <IconTrophy size={14} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: 14, color: 'var(--text-3)', textTransform: 'uppercase',
              letterSpacing: '0.1em' }}>{league_snapshot?.year} Champion</span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar initials={initials(champion.display_name)} size={44} gold />
            <div className="flex-1">
              <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-1)' }}>
                {champion.display_name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                {champion.team_name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--gold)' }}>
                {champion.wins}–{champion.losses}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                {champion.points_for?.toFixed(1)} pts
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Last place ───────────────────────────────────────────────────── */}
      {last_place && (
        <div className="rounded-xl p-4"
          style={{ background: 'var(--bg-card)', border: '0.5px solid rgba(207,95,95,0.3)' }}>
          <div className="flex items-center gap-1 mb-3">
            <IconMoodSad size={14} style={{ color: '#CF5F5F' }} />
            <span style={{ fontSize: 14, color: 'var(--text-3)', textTransform: 'uppercase',
              letterSpacing: '0.1em' }}>{league_snapshot?.year} Last Place</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{ width: 44, height: 44, background: 'rgba(207,95,95,0.08)',
                border: '1.5px solid #CF5F5F', fontSize: 14, fontWeight: 500, color: '#CF5F5F' }}>
              {initials(last_place.display_name)}
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-1)' }}>
                {last_place.display_name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                {last_place.team_name}
              </div>
            </div>
          </div>
          {last_place.punishment && (
            <div className="rounded-lg px-3 py-2 mt-3"
              style={{ background: 'rgba(207,95,95,0.06)', border: '0.5px solid rgba(207,95,95,0.2)',
                fontSize: 11, color: '#CF5F5F', lineHeight: 1.5 }}>
              {last_place.punishment}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
