// src/App.jsx
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import LoginScreen from './screens/LoginScreen'
import TopBar        from './components/shell/TopBar'
import BottomNav     from './components/shell/BottomNav'
import PillBar       from './components/shell/PillBar'
import HamburgerMenu from './components/shell/HamburgerMenu'
import SettingsMenu from './components/shell/SettingsMenu'
import SectionNav from './components/shell/SectionNav'
import HomeScreen    from './screens/HomeScreen'
import { PhotoProvider } from './context/PhotoContext'
import ManagerScreen from './screens/ManagerScreen'
import LeagueScreen from './screens/LeagueScreen'
import SeasonScreen from './screens/SeasonScreen'
import TeamsScreen from './screens/TeamsScreen'
import MediaScreen from './screens/MediaScreen'
import SettingsProfileScreen      from './screens/settings/SettingsProfileScreen'
import SettingsUploadScreen       from './screens/settings/SettingsUploadScreen'
import SettingsProposalScreen     from './screens/settings/SettingsProposalScreen'
import SettingsVotingScreen       from './screens/settings/SettingsVotingScreen'
import SettingsNotificationScreen from './screens/settings/SettingsNotificationScreen'
import BettingScreen from './screens/BettingScreen'
import { DEV_USER }  from './config'
import HomePage from "./screens/HomePage"

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function PlaceholderScreen({ label }) {
  return (
    <div className="flex items-center justify-center flex-1">
      <p style={{ color: 'var(--text-3)', fontSize: 12, letterSpacing: '0.08em',
        textTransform: 'uppercase' }}>{label}</p>
    </div>
  )
}

const SECTION_PILLS = {
  '/fantasy/league': [
    { key: 'home',    label: 'Home',    icon: 'home'          },
    { key: 'records', label: 'Records', icon: 'trophy'        },
    { key: 'history', label: 'History', icon: 'clock-history' },
    { key: 'rules',   label: 'Rules',   icon: 'file-text'     },
  ],
  '/fantasy/season': [
    { key: 'standings', label: 'Standings', icon: 'list-numbers' },
    { key: 'playoffs',  label: 'Playoffs',  icon: 'tournament'   },
  ],
  '/fantasy/teams': [
    { key: 'grid',   label: 'H2H Grid', icon: 'layout-grid' },
    { key: 'my-h2h', label: 'My H2H',  icon: 'user-check'  },
  ],
}

function getSectionLabel(pathname) {
  if (pathname === '/')                return 'BlackGold'
  if (pathname.startsWith('/fantasy')) return 'Fantasy'
  if (pathname.startsWith('/media')) return 'Media'
  if (pathname.startsWith('/betting')) return 'Betting'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'BlackGold'
}

function getCurrentSection(pathname) {
  if (pathname.startsWith('/fantasy'))    return 'fantasy'
  if (pathname.startsWith('/basketball')) return 'basketball'
  if (pathname.startsWith('/betting'))    return 'betting'
  if (pathname.startsWith('/media'))      return 'media'
  return null
}

function getBasePath(pathname) {
  return Object.keys(SECTION_PILLS).find(k => pathname.startsWith(k)) || null
}

export default function App() {
  const location  = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activePills, setActivePills] = useState({
    '/fantasy/league': 'home',
    '/fantasy/season': 'standings',
    '/fantasy/teams':  'grid',
  })

  // Check for existing token on mount
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('bg_jwt')
    if (!token) { setAuthLoading(false); return }
    fetch('https://bgyfpy-backend.onrender.com/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (d.manager_id) setCurrentUser(d) })
      .catch(() => localStorage.removeItem('bg_jwt'))
      .finally(() => setAuthLoading(false))
  }, [])   // ← closes useEffect

  const handleLogin = (data) => { setCurrentUser(data) }
  const handleLogout = () => {
    localStorage.removeItem('bg_jwt')
    setCurrentUser(null)
  }
  const handleProfileUpdate = (updatedUser) => setCurrentUser(updatedUser)

  const basePath  = getBasePath(location.pathname)
  const pills     = basePath ? SECTION_PILLS[basePath] : []
  const activeKey = basePath ? activePills[basePath] : null


  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {authLoading ? (
        <div style={{ height:'100dvh', background:'#0f0f0f',
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <img src="/icons/blackgold-logo.png" style={{ width:80, opacity:0.6 }}/>
        </div>
      ) : !currentUser ? (
        <LoginScreen onLogin={handleLogin}/>
      ) : (
        <PhotoProvider>
          <div
            className="flex flex-col"
            style={{
              height:     '100dvh',
              maxWidth:   430,
              margin:     '0 auto',
              background: 'var(--bg-app)',
              overflow:   'hidden',
              position:   'relative',
            }}
          >
            <TopBar
              section={getSectionLabel(location.pathname)}
              onHamburger={() => setMenuOpen(true)}
              onSettings={() => setSettingsOpen(true)}
              currentUser={currentUser}
            />
            <div className="flex flex-1 overflow-hidden">
              <Routes>
                <Route path="/"               element={<HomePage />} />
                <Route path="/fantasy/manager/:name" element={<ManagerScreen />} />
                <Route path="/fantasy/league" element={<LeagueScreen />} />
                <Route path="/fantasy/league/rules" element={<LeagueScreen />} /> 
                <Route path="/fantasy/season" element={<SeasonScreen />} /> 
                <Route path="/fantasy/season/standings" element={<SeasonScreen />} /> 
                <Route path="/fantasy/teams"  element={<TeamsScreen />} /> 
                <Route path="/media"             element={<MediaScreen />} />
                <Route path="/media/content"     element={<MediaScreen />} />
                <Route path="/media/punishment"  element={<MediaScreen />} />
                <Route path="/media/ice-videos"  element={<MediaScreen />} />
                <Route path="/media/food-reviews"element={<MediaScreen />} />
                {/* Betting */}
                <Route path="/betting"            element={<BettingScreen currentUser={currentUser}/>} />
                <Route path="/betting/parlays"    element={<BettingScreen currentUser={currentUser}/>} />
                <Route path="/betting/water-bets" element={<BettingScreen currentUser={currentUser}/>} />
                <Route path="/betting/season"     element={<BettingScreen currentUser={currentUser}/>} />
                <Route path="/betting/overall"    element={<BettingScreen currentUser={currentUser}/>} />

                {/* Settings */}
                <Route path="/settings/profile"      element={<SettingsProfileScreen      onBack={()=>navigate(-1)} currentUser={currentUser} onProfileUpdate={handleProfileUpdate} onLogout={handleLogout}/>}/>
                <Route path="/settings/upload"       element={<SettingsUploadScreen       onBack={()=>navigate(-1)} currentUser={currentUser}/>}/>
                <Route path="/settings/proposal"     element={<SettingsProposalScreen     onBack={()=>navigate(-1)} currentUser={currentUser}/>}/>
                <Route path="/settings/voting"       element={<SettingsVotingScreen       onBack={()=>navigate(-1)} currentUser={currentUser}/>}/>
                <Route path="/settings/notification" element={<SettingsNotificationScreen onBack={()=>navigate(-1)} currentUser={currentUser}/>}/>
                <Route path="*"               element={<Navigate to="/" replace />} />
              </Routes>
            </div>

            {/* Frozen bottom nav — ALWAYS visible, home included */}
            {!location.pathname.startsWith('/media') &&
              !location.pathname.startsWith('/betting') && (
              <BottomNav user={currentUser} section={getCurrentSection(location.pathname) || 'fantasy'} />
            )}

            {/* Hamburger drawer */}
            <HamburgerMenu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              currentSection={getCurrentSection(location.pathname)}
            />

          <SettingsMenu
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            currentUser={currentUser}
          />
          </div>
        </PhotoProvider>
      )}
    </GoogleOAuthProvider>
  )
}