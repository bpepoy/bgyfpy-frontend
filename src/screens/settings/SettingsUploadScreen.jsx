// src/screens/settings/SettingsUploadScreen.jsx
import { useState, useEffect } from 'react'

const API           = 'https://bgyfpy-backend.onrender.com'
const CLOUD_NAME    = 'fyfcrvbi'
const UPLOAD_PRESET = 'bgyfpy_uploads'
const GOLD          = '#D4A843'
const GOLD_DIM      = 'rgba(212,168,67,0.15)'
const GOLD_BORDER   = 'rgba(212,168,67,0.3)'
const BG_CARD       = '#1e1e1e'
const TEXT_1        = '#F0E6CC'
const TEXT_2        = '#A89060'
const TEXT_3        = '#967843'
const GREEN         = '#5DBF6A'
const RED           = '#CF5F5F'

const DEV_USER = { manager_id:'brian', display_name:'Brian' }

function Label({ children }) {
  return (
    <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em',
      textTransform:'uppercase', marginBottom:8 }}>{children}</div>
  )
}

function RadioGroup({ options, value, onChange }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {options.map(o => (
        <label key={o.key} style={{ display:'flex', alignItems:'center', gap:10,
          cursor:'pointer', padding:'10px 12px', borderRadius:10,
          background:value===o.key ? GOLD_DIM : BG_CARD,
          border:`0.5px solid ${value===o.key ? GOLD : GOLD_BORDER}` }}>
          <div style={{ width:18, height:18, borderRadius:'50%',
            border:`2px solid ${value===o.key ? GOLD : TEXT_3}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0 }}>
            {value===o.key && (
              <div style={{ width:8, height:8, borderRadius:'50%', background:GOLD }}/>
            )}
          </div>
          <input type="radio" value={o.key} checked={value===o.key}
            onChange={() => onChange(o.key)} style={{ display:'none' }}/>
          <span style={{ fontSize:13, color:value===o.key ? GOLD : TEXT_1 }}>
            {o.label}
          </span>
        </label>
      ))}
    </div>
  )
}

function CheckboxGroup({ options, value=[], onChange }) {
  const toggle = (k) => {
    if (value.includes(k)) onChange(value.filter(v => v!==k))
    else onChange([...value, k])
  }
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
      {options.map(o => {
        const active = value.includes(o.key)
        return (
          <button key={o.key} onClick={() => toggle(o.key)}
            style={{ padding:'6px 14px', borderRadius:14, border:'none', cursor:'pointer',
              background:active ? GOLD_DIM : 'rgba(255,255,255,0.04)',
              borderWidth:active?1:0.5, borderStyle:'solid',
              borderColor:active ? GOLD : 'rgba(255,255,255,0.06)',
              fontSize:11, color:active ? GOLD : TEXT_3,
              fontWeight:active?600:400 }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function TextInput({ label, value, onChange, placeholder, multiline, type='text' }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <Label>{label}</Label>}
      {multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={3}
          style={{ width:'100%', padding:'10px 12px', borderRadius:10,
            border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
            color:TEXT_1, fontSize:13, resize:'none', boxSizing:'border-box',
            fontFamily:'inherit' }}/>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width:'100%', padding:'10px 12px', borderRadius:10,
            border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
            color:TEXT_1, fontSize:13, boxSizing:'border-box' }}/>
      )}
    </div>
  )
}

export default function SettingsUploadScreen({ onBack }) {
  const user = DEV_USER

  const [category, setCategory] = useState('content')
  const [tag,      setTag]      = useState('extra')
  const [file,     setFile]     = useState(null)
  const [preview,  setPreview]  = useState(null)
  const [restaurant, setRestaurant] = useState('')
  const [menuItem,   setMenuItem]   = useState('')
  const [rating,     setRating]     = useState('')
  const [reviewText, setReviewText] = useState('')
  const [punishmentText, setPunishmentText] = useState('')
  const [punishmentYear, setPunishmentYear] = useState(new Date().getFullYear())
  const [restaurants, setRestaurants] = useState([])
  const [uploading,  setUploading]  = useState(false)
  const [status,     setStatus]     = useState(null)

  useEffect(() => {
    fetch(`${API}/media/restaurants`)
      .then(r => r.json())
      .then(d => setRestaurants(d.restaurants || []))
      .catch(() => {})
  }, [])

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setStatus(null)
  }

  const reset = () => {
    setFile(null); setPreview(null); setTag('extra')
    setRestaurant(''); setMenuItem(''); setRating(''); setReviewText('')
    setStatus(null)
  }

  const handleUpload = async () => {
    // Punishment text — no file needed
    if (category === 'punishment_text') {
      if (!punishmentText.trim()) {
        setStatus({ type:'error', msg:'Punishment text is required.' })
        return
      }
      setUploading(true)
      setStatus(null)
      try {
        await fetch(`${API}/settings/punishment`, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            manager_id: user?.manager_id,
            year: punishmentYear,
            punishment: punishmentText.trim(),
          })
        })
        setStatus({ type:'success', msg:'Punishment saved!' })
        setPunishmentText('')
      } catch(e) {
        setStatus({ type:'error', msg:'Failed to save punishment.' })
      } finally {
        setUploading(false)
      }
      return
    }

    if (!file) return
    if (category === 'food_review' && !rating) {
      setStatus({ type:'error', msg:'Rating is required for food reviews.' })
      return
    }
    if (category === 'food_review' && !restaurant) {
      setStatus({ type:'error', msg:'Restaurant is required for food reviews.' })
      return
    }

    setUploading(true)
    setStatus(null)

    try {
      // 1. Upload to Cloudinary
      const isVideo   = file.type.startsWith('video/')
      const resource  = isVideo ? 'video' : 'image'
      const form      = new FormData()
      form.append('file', file)
      form.append('upload_preset', UPLOAD_PRESET)
      form.append('folder', category)

      const cRes  = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource}/upload`,
        { method:'POST', body:form }
      )
      const cData = await cRes.json()
      if (!cData.secure_url) throw new Error('Upload failed')

      // Extract date from Cloudinary metadata
      const mediaDate = cData.created_at
        ? cData.created_at.slice(0, 10)
        : new Date().toISOString().slice(0, 10)

      // 2. Save to backend
      const body = {
        manager_id:     user.manager_id,
        media_type:     isVideo ? 'video' : 'photo',
        category,
        cloudinary_url: cData.secure_url,
        cloudinary_id:  cData.public_id,
        tags: tag ? [tag] : ['extra'],
        media_date:     mediaDate,
        ...(category === 'food_review' && {
          restaurant,
          menu_item:   menuItem,
          rating:      parseFloat(rating),
          review_text: reviewText || null,
        })
      }

      await fetch(`${API}/settings/upload`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body)
      })

      setStatus({ type:'success', msg:'Uploaded successfully!' })
      reset()
    } catch (err) {
      setStatus({ type:'error', msg:'Upload failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

  const CAN_UPLOAD_PUNISHMENT = ['brian','zef']
  const CATEGORIES = [
  { key:'content',          label:'Content' },
  { key:'punishment',       label:'Punishment (Photo/Video)' },
  { key:'ice_video',        label:'Ice Video' },
  { key:'food_review',      label:'Food Review' },
  ...(CAN_UPLOAD_PUNISHMENT.includes(user?.manager_id)
    ? [{ key:'punishment_text', label:'Punishment (Vote)' }] : []),
]
  const CONTENT_TAGS = [
    { key:'draft_weekend', label:'Draft Weekend' },
    { key:'meme',          label:'Meme' },
    { key:'faceswap',      label:'Faceswap' },
    { key:'extra',         label:'Extra' },
  ]

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
          UPLOAD
        </div>
      </div>

      <div style={{ padding:'16px', paddingBottom:32 }}>

        {/* Category */}
        <div style={{ marginBottom:20 }}>
          <Label>Category</Label>
          <RadioGroup options={CATEGORIES} value={category}
            onChange={v => { setCategory(v); reset() }}/>
        </div>

        {/* Content tags */}
        {category === 'content' && (
          <div style={{ marginBottom:20 }}>
            <Label>Tag</Label>
            <RadioGroup options={CONTENT_TAGS} value={tag} onChange={setTag}/>
          </div>
        )}

        {/* Food review fields */}
        {category === 'food_review' && (
          <>
            <div style={{ marginBottom:16 }}>
              <Label>Restaurant *</Label>
              <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                <select value={restaurant} onChange={e => setRestaurant(e.target.value)}
                  style={{ flex:1, padding:'10px 12px', borderRadius:10,
                    border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
                    color:restaurant ? TEXT_1 : TEXT_3, fontSize:13, cursor:'pointer' }}>
                  <option value="">Select restaurant…</option>
                  {restaurants.map(r => (
                    <option key={r.id||r.name} value={r.name}>{r.name}</option>
                  ))}
                  <option value="__new__">+ New restaurant…</option>
                </select>
              </div>
              {restaurant === '__new__' && (
                <input type="text" placeholder="Enter restaurant name"
                  onChange={e => setRestaurant(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:10,
                    border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
                    color:TEXT_1, fontSize:13, boxSizing:'border-box' }}/>
              )}
            </div>
            <TextInput label="Menu Item" value={menuItem} onChange={setMenuItem}
              placeholder="e.g. Pepperoni Pizza"/>
            <div style={{ marginBottom:16 }}>
              <Label>Rating (0–10) *</Label>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <input type="range" min="0" max="10" step="0.5"
                  value={rating||0} onChange={e => setRating(e.target.value)}
                  style={{ flex:1, accentColor:GOLD }}/>
                <div style={{ fontSize:18, fontWeight:600, color:GOLD,
                  minWidth:36, textAlign:'right' }}>{rating||'0'}</div>
              </div>
            </div>
            <TextInput label="Review (optional)" value={reviewText}
              onChange={setReviewText}
              placeholder="Write your review…" multiline/>
          </>
        )}

        {/* Punishment text */}
        {category === 'punishment_text' && (
          <>
            <div style={{ marginBottom:16 }}>
              <Label>Season Year</Label>
              <input type="number" value={punishmentYear}
                onChange={e => setPunishmentYear(parseInt(e.target.value))}
                style={{ width:'100%', padding:'10px 12px', borderRadius:10,
                  border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
                  color:TEXT_1, fontSize:13, boxSizing:'border-box' }}/>
            </div>
            <div style={{ marginBottom:20 }}>
              <Label>Punishment Text *</Label>
              <textarea value={punishmentText} onChange={e => setPunishmentText(e.target.value)}
                placeholder="Describe the punishment…" rows={4}
                style={{ width:'100%', padding:'10px 12px', borderRadius:10,
                  border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
                  color:TEXT_1, fontSize:13, resize:'none', boxSizing:'border-box',
                  fontFamily:'inherit', lineHeight:1.6 }}/>
            </div>
          </>
        )}

        {/* File picker — not needed for punishment text */}
        {category !== 'punishment_text' && <div style={{ marginBottom:20 }}>
          <Label>
            {category === 'ice_video' ? 'Video' : 'Photo or Video'}
          </Label>
          <label style={{ cursor:'pointer', display:'block' }}>
            <input type="file"
              accept={category === 'ice_video' ? 'video/*' : 'image/*,video/*'}
              onChange={handleFile} style={{ display:'none' }}/>
            {preview ? (
              <div style={{ position:'relative', borderRadius:12, overflow:'hidden',
                border:`1px solid ${GOLD_BORDER}`, marginBottom:8 }}>
                {file?.type?.startsWith('video/') ? (
                  <video src={preview} controls
                    style={{ width:'100%', maxHeight:220, objectFit:'cover' }}/>
                ) : (
                  <img src={preview} alt="Preview"
                    style={{ width:'100%', maxHeight:220, objectFit:'cover' }}/>
                )}
                <div style={{ position:'absolute', top:8, right:8,
                  background:'rgba(0,0,0,0.7)', borderRadius:20,
                  padding:'4px 10px', fontSize:10, color:TEXT_2, cursor:'pointer' }}
                  onClick={e => { e.preventDefault(); reset() }}>
                  Change
                </div>
              </div>
            ) : (
              <div style={{ padding:'32px 16px', borderRadius:12, textAlign:'center',
                border:`1px dashed ${GOLD_BORDER}`, background:BG_CARD,
                color:TEXT_3, fontSize:12 }}>
                <div style={{ fontSize:28, marginBottom:8 }}>📎</div>
                Tap to select photo or video
              </div>
            )}
          </label>
        </div>}

        {/* Status */}
        {status && (
          <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:16,
            background:status.type==='success'?'rgba(93,191,106,0.1)':'rgba(207,95,95,0.1)',
            border:`0.5px solid ${status.type==='success'?'rgba(93,191,106,0.3)':'rgba(207,95,95,0.3)'}`,
            fontSize:12, color:status.type==='success'?GREEN:RED }}>
            {status.msg}
          </div>
        )}

        {/* Upload button */}
        <button onClick={handleUpload} disabled={!file || uploading}
          style={{ width:'100%', padding:'14px', borderRadius:12, border:'none',
            cursor:!file||uploading ? 'default' : 'pointer',
            background:!file||uploading ? 'rgba(255,255,255,0.04)' : GOLD_DIM,
            borderWidth:1, borderStyle:'solid',
            borderColor:!file||uploading ? 'rgba(255,255,255,0.08)' : GOLD,
            fontSize:13, fontWeight:600,
            color:!file||uploading ? TEXT_3 : GOLD }}>
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
    </div>
  )
}