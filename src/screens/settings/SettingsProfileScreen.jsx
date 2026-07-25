// src/screens/settings/SettingsProfileScreen.jsx
import { useState, useEffect } from 'react'
import { useUpdatePhoto } from '../../context/PhotoContext'

const API         = 'https://bgyfpy-backend.onrender.com'
const CLOUD_NAME  = 'fyfcrvbi'
const UPLOAD_PRESET = 'bgyfpy_uploads'
const GOLD        = '#D4A843'
const GOLD_DIM    = 'rgba(212,168,67,0.15)'
const GOLD_BORDER = 'rgba(212,168,67,0.3)'
const BG_CARD     = '#1e1e1e'
const TEXT_1      = '#F0E6CC'
const TEXT_2      = '#A89060'
const TEXT_3      = '#967843'
const GREEN       = '#5DBF6A'
const RED         = '#CF5F5F'

const INITIALS = {
  blake:'BJ', brian:'BP', frank:'FL', jake:'JK',
  joey:'JY', jordan:'JM', kyle:'KB', nick:'ND', rob:'RD', zef:'ZD'
}


export default function SettingsProfileScreen({ onBack, onProfileUpdate, onLogout, currentUser }) {
  const [user, setUser] = useState(currentUser)
  const [uploading, setUploading] = useState(false)
  const [photoUrl,  setPhotoUrl]  = useState(null)
  const [status,    setStatus]    = useState(null)

  const updatePhoto = useUpdatePhoto()

  // After successful upload:
  
  
  
   // Fetch real profile on mount
  useEffect(() => {
    fetch(`${API}/settings/profile/${currentUser.manager_id}`)
      .then(r => r.json())
      .then(d => {
        if (d.manager_id) {
          setUser(d)
          setPhotoUrl(d.photo_url || null)
        }
      })
      .catch(() => {})
  }, [])

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setStatus(null)

    try {
      // 1. Upload to Cloudinary
      const form = new FormData()
      form.append('file', file)
      form.append('upload_preset', UPLOAD_PRESET)
      form.append('folder', 'profiles')

      const cRes  = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, 
        { method:'POST', body:form }
      )
      const cData = await cRes.json()

      if (!cData.secure_url) throw new Error('Cloudinary upload failed')

      // Build face-detected circular crop URL
      const parts   = cData.secure_url.split('/upload/')
      const cropUrl = `${parts[0]}/upload/w_400,h_400,c_fill,g_face,r_max/${parts[1]}`
      setPhotoUrl(cropUrl)
      updatePhoto(user.manager_id, cropUrl)  // ← updates all avatars app-wide
      if (onProfileUpdate) onProfileUpdate({ ...user, photo_url: cropUrl })

      // 2. Save to backend
      await fetch(`${API}/settings/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          manager_id:    user.manager_id,
          photo_url:     cropUrl,
          cloudinary_id: cData.public_id,
        })
      })

      setPhotoUrl(cropUrl)
      setStatus('success')
      // Notify parent so other screens update
      if (onProfileUpdate) onProfileUpdate({ ...user, photo_url:cropUrl })
    } catch (err) {
      console.error(err)
      setStatus('error')
    } finally {
      setUploading(false)
    }
  }

  const ini = INITIALS[user.manager_id] || user.display_name.slice(0,2).toUpperCase()

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
          PROFILE
        </div>
      </div>

      <div style={{ padding:'32px 24px 24px', display:'flex',
        flexDirection:'column', alignItems:'center', gap:24 }}>

        {/* Current avatar */}
        <div style={{ position:'relative' }}>
          <div style={{ width:100, height:100, borderRadius:'50%',
            border:`2px solid ${GOLD}`, overflow:'hidden',
            display:'flex', alignItems:'center', justifyContent:'center',
            background:GOLD_DIM, fontSize:28, fontWeight:500, color:GOLD }}>
            {photoUrl
              ? <img src={photoUrl} alt="Profile"
                  style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              : ini
            }
          </div>
        </div>

        {/* Name */}
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:20, fontWeight:500, color:TEXT_1 }}>
            {user.display_name}
          </div>
          <div style={{ fontSize:11, color:TEXT_3, marginTop:4 }}>
            {user.manager_id}
          </div>
        </div>

        {/* Upload button */}
        <label style={{ cursor:'pointer', width:'100%' }}>
          <input type="file" accept="image/*" onChange={handleFileChange}
            style={{ display:'none' }}/>
          <div style={{ padding:'14px', borderRadius:12, textAlign:'center',
            background:uploading ? 'rgba(255,255,255,0.04)' : GOLD_DIM,
            border:`1px solid ${uploading ? 'rgba(255,255,255,0.08)' : GOLD}`,
            fontSize:13, fontWeight:500,
            color:uploading ? TEXT_3 : GOLD,
            cursor:uploading ? 'default' : 'pointer' }}>
            {uploading ? 'Uploading…' : photoUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}
          </div>
        </label>

        {/* Status messages */}
        {status === 'success' && (
          <div style={{ padding:'10px 16px', borderRadius:10,
            background:'rgba(93,191,106,0.1)',
            border:`0.5px solid rgba(93,191,106,0.3)`,
            fontSize:12, color:GREEN, textAlign:'center', width:'100%' }}>
            ✓ Profile photo updated!
          </div>
        )}
        {status === 'error' && (
          <div style={{ padding:'10px 16px', borderRadius:10,
            background:'rgba(207,95,95,0.1)',
            border:`0.5px solid rgba(207,95,95,0.3)`,
            fontSize:12, color:RED, textAlign:'center', width:'100%' }}>
            Upload failed. Please try again.
          </div>
        )}

        {/* Logout */}
        <button onClick={onLogout}
          style={{ width:'100%', padding:'13px', borderRadius:12, border:'none',
            cursor:'pointer', background:'rgba(207,95,95,0.08)',
            borderWidth:1, borderStyle:'solid', borderColor:'rgba(207,95,95,0.25)',
            fontSize:13, fontWeight:500, color:'#CF5F5F' }}>
          Sign Out
        </button>

        {/* Info note */}
        <div style={{ padding:'12px 14px', borderRadius:10,
          background:BG_CARD, border:`0.5px solid rgba(255,255,255,0.06)`,
          fontSize:11, color:TEXT_3, lineHeight:1.6, width:'100%' }}>
          Your photo will be automatically cropped to a circle and centered on your face.
          Use a clear, front-facing photo for best results.
        </div>
      </div>
    </div>
  )
}