// src/screens/LoginScreen.jsx
import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'

const API         = 'https://bgyfpy-backend.onrender.com'
const GOLD        = '#D4A843'
const GOLD_DIM    = 'rgba(212,168,67,0.15)'
const GOLD_BORDER = 'rgba(212,168,67,0.3)'
const BG_CARD     = '#1e1e1e'
const TEXT_1      = '#F0E6CC'
const TEXT_2      = '#A89060'
const TEXT_3      = '#967843'
const GREEN       = '#5DBF6A'
const RED         = '#CF5F5F'

export default function LoginScreen({ onLogin }) {
  const [magicEmail,  setMagicEmail]  = useState('')
  const [magicSent,   setMagicSent]   = useState(false)
  const [magicCode,   setMagicCode]   = useState('')
  const [error,       setError]       = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [showMagic,   setShowMagic]   = useState(false)

// ── Google OAuth ────────────────────────────────────────────────────────────
const handleGoogleSuccess = async (credentialResponse) => {
  setLoading(true)
  setError(null)
  try {
    const res = await fetch(`${API}/auth/verify-google-token`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id_token: credentialResponse.credential }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Login failed')
    localStorage.setItem('bg_jwt', data.session_token)
    onLogin({ ...data.manager, permissions: data.permissions, token: data.session_token })
  } catch (e) {
    setError(e.message || 'Google sign-in failed. Please try again.')
  } finally {
    setLoading(false)
  }
}

  // ── Magic link ──────────────────────────────────────────────────────────────
  const handleMagicSend = async () => {
    if (!magicEmail.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(`${API}/auth/magic-link`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: magicEmail.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to send link')
      setMagicSent(true)
    } catch (e) {
      setError(e.message || 'Failed to send magic link.')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicVerify = async () => {
    if (!magicCode.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch(`${API}/auth/verify-magic-link`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: magicCode.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Invalid or expired link')
      localStorage.setItem('bg_jwt', data.token)
      onLogin(data)
    } catch (e) {
      setError(e.message || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100%', height: '100dvh',
      background: '#0f0f0f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 32px',
    }}>
      {/* Logo */}
      <img src="/icons/blackgold-logo.png" alt="BlackGold"
        style={{ width: 200, height: 200, borderRadius: 16, marginBottom: 24 }}/>

      {/* Title */}
      <div style={{
        fontSize: 28, fontWeight: 600, color: TEXT_2,
        letterSpacing: '0.06em', marginBottom: 6,
      }}>BLACKGOLD</div>
      <div style={{
        fontSize: 12, color: TEXT_2, letterSpacing: '0.18em',
        marginBottom: 48,
      }}>EST. 2007</div>

      {/* Error */}
      {error && (
        <div style={{
          width: '100%', maxWidth: 320,
          padding: '10px 14px', borderRadius: 10, marginBottom: 16,
          background: 'rgba(207,95,95,0.1)',
          border: '0.5px solid rgba(207,95,95,0.3)',
          fontSize: 12, color: RED, textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {!showMagic ? (
        /* ── Main login ── */
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Google Login button — uses id_token flow */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in was cancelled or failed.')}
              width="320"
              theme="filled_black"
              shape="rectangular"
              text="signin_with"
            />
          </div>
          {loading && (
            <div style={{ textAlign:'center', fontSize:12, color:TEXT_2 }}>
              Signing in…
            </div>
          )}

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0',
          }}>
            <div style={{ flex: 1, height: 0.5, background: 'rgba(255,255,255,0.08)' }}/>
            <span style={{ fontSize: 10, color: TEXT_3, letterSpacing: '0.1em' }}>OR</span>
            <div style={{ flex: 1, height: 0.5, background: 'rgba(255,255,255,0.08)' }}/>
          </div>

          {/* Magic link option */}
          <button
            onClick={() => { setShowMagic(true); setError(null) }}
            style={{
              width: '100%', padding: '13px 20px',
              borderRadius: 12, cursor: 'pointer',
              background: GOLD_DIM,
              border: `1px solid ${GOLD_BORDER}`,
              fontSize: 13, fontWeight: 500, color: GOLD,
            }}>
            Sign in with Email Link
          </button>

          <div style={{
            fontSize: 10, color: TEXT_3, textAlign: 'center', marginTop: 8, lineHeight: 1.6,
          }}>
            Email link is for Frank & Rob only
          </div>
        </div>
      ) : (
        /* ── Magic link flow ── */
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!magicSent ? (
            <>
              <div style={{ fontSize: 13, color: TEXT_2, textAlign: 'center', marginBottom: 4 }}>
                Enter your email to receive a sign-in link
              </div>
              <input
                type="email"
                value={magicEmail}
                onChange={e => setMagicEmail(e.target.value)}
                placeholder="your@email.com"
                onKeyDown={e => e.key === 'Enter' && handleMagicSend()}
                style={{
                  padding: '12px 14px', borderRadius: 10,
                  border: `0.5px solid ${GOLD_BORDER}`,
                  background: BG_CARD, color: TEXT_1,
                  fontSize: 14, width: '100%', boxSizing: 'border-box',
                }}/>
              <button onClick={handleMagicSend} disabled={loading||!magicEmail.trim()}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                  cursor: magicEmail&&!loading ? 'pointer' : 'default',
                  background: magicEmail&&!loading ? GOLD_DIM : 'rgba(255,255,255,0.04)',
                  borderWidth: 1, borderStyle: 'solid',
                  borderColor: magicEmail&&!loading ? GOLD : 'rgba(255,255,255,0.08)',
                  fontSize: 13, fontWeight: 500,
                  color: magicEmail&&!loading ? GOLD : TEXT_3,
                }}>
                {loading ? 'Sending…' : 'Send Sign-in Link'}
              </button>
            </>
          ) : (
            <>
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(93,191,106,0.1)',
                border: '0.5px solid rgba(93,191,106,0.3)',
                fontSize: 12, color: GREEN, textAlign: 'center',
              }}>
                ✓ Link sent to {magicEmail}
              </div>
              <div style={{ fontSize: 12, color: TEXT_2, textAlign: 'center' }}>
                Check your email and paste the code below
              </div>
              <input
                type="text"
                value={magicCode}
                onChange={e => setMagicCode(e.target.value)}
                placeholder="Paste your sign-in code"
                style={{
                  padding: '12px 14px', borderRadius: 10,
                  border: `0.5px solid ${GOLD_BORDER}`,
                  background: BG_CARD, color: TEXT_1,
                  fontSize: 14, width: '100%', boxSizing: 'border-box',
                }}/>
              <button onClick={handleMagicVerify} disabled={loading||!magicCode.trim()}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                  cursor: magicCode&&!loading ? 'pointer' : 'default',
                  background: magicCode&&!loading ? GOLD_DIM : 'rgba(255,255,255,0.04)',
                  borderWidth: 1, borderStyle: 'solid',
                  borderColor: magicCode&&!loading ? GOLD : 'rgba(255,255,255,0.08)',
                  fontSize: 13, fontWeight: 500,
                  color: magicCode&&!loading ? GOLD : TEXT_3,
                }}>
                {loading ? 'Verifying…' : 'Verify & Sign In'}
              </button>
            </>
          )}

          <button onClick={() => { setShowMagic(false); setMagicSent(false); setMagicCode(''); setError(null) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: TEXT_3, textAlign: 'center', padding: 4,
            }}>
            ← Back to sign in options
          </button>
        </div>
      )}
    </div>
  )
}