// src/screens/settings/SettingsProposalScreen.jsx
import { useState } from 'react'

const API         = 'https://bgyfpy-backend.onrender.com'
const CLOUD_NAME  = 'fyfcrvbi'
const UPLOAD_PRESET = 'bgyfpy_uploads'
const GOLD        = '#D4A843'
const GOLD_DIM    = 'rgba(212,168,67,0.15)'
const GOLD_BORDER = 'rgba(212,168,67,0.3)'
const BG_CARD     = '#1e1e1e'
const TEXT_1      = '#F0E6CC'
const TEXT_2      = '#A89060'
const TEXT_3      = '#5A4828'
const GREEN       = '#5DBF6A'
const RED         = '#CF5F5F'


export default function SettingsProposalScreen({ onBack, currentUser  }) {
  const [user, setUser] = useState(currentUser)

  const [title,       setTitle]      = useState('')
  const [description, setDesc]       = useState('')
  const [file,        setFile]       = useState(null)
  const [preview,     setPreview]    = useState(null)
  const [uploading,   setUploading]  = useState(false)
  const [status,      setStatus]     = useState(null)

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setStatus({ type:'error', msg:'Title and description are required.' })
      return
    }
    setUploading(true)
    setStatus(null)

    try {
      let attachmentUrl = null

      // Upload attachment if present
      if (file) {
        const isVideo = file.type.startsWith('video/')
        const form    = new FormData()
        form.append('file', file)
        form.append('upload_preset', UPLOAD_PRESET)
        form.append('folder', 'proposals')
        const cRes  = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${isVideo?'video':'image'}/upload`,
          { method:'POST', body:form }
        )
        const cData = await cRes.json()
        attachmentUrl = cData.secure_url || null
      }

      await fetch(`${API}/settings/proposals/submit`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          submitted_by:   user.manager_id,
          title:          title.trim(),
          description:    description.trim(),
          attachment_url: attachmentUrl,
        })
      })

      setStatus({ type:'success', msg:'Rule proposal submitted!' })
      setTitle(''); setDesc(''); setFile(null); setPreview(null)
    } catch(err) {
      setStatus({ type:'error', msg:'Submission failed. Please try again.' })
    } finally {
      setUploading(false)
    }
  }

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
          RULE PROPOSAL
        </div>
      </div>

      <div style={{ padding:'16px', paddingBottom:32 }}>

        {/* Info */}
        <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:20,
          background:BG_CARD, border:`0.5px solid rgba(255,255,255,0.06)`,
          fontSize:11, color:TEXT_3, lineHeight:1.6 }}>
          Submit a rule change proposal. All 10 managers will vote to approve or reject.
          A majority of 6 votes is needed to pass.
        </div>

        {/* Title */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em',
            textTransform:'uppercase', marginBottom:8 }}>Title *</div>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Add a flex spot to the roster"
            style={{ width:'100%', padding:'10px 12px', borderRadius:10,
              border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
              color:TEXT_1, fontSize:13, boxSizing:'border-box' }}/>
        </div>

        {/* Description */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em',
            textTransform:'uppercase', marginBottom:8 }}>Description *</div>
          <textarea value={description} onChange={e => setDesc(e.target.value)}
            placeholder="Describe the rule change and why you think it should be adopted…"
            rows={5}
            style={{ width:'100%', padding:'10px 12px', borderRadius:10,
              border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
              color:TEXT_1, fontSize:13, resize:'none', boxSizing:'border-box',
              fontFamily:'inherit', lineHeight:1.6 }}/>
        </div>

        {/* Attachment */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em',
            textTransform:'uppercase', marginBottom:8 }}>Attachment (optional)</div>
          <label style={{ cursor:'pointer', display:'block' }}>
            <input type="file" accept="image/*,video/*"
              onChange={handleFile} style={{ display:'none' }}/>
            {preview ? (
              <div style={{ position:'relative', borderRadius:12,
                overflow:'hidden', border:`1px solid ${GOLD_BORDER}` }}>
                {file?.type?.startsWith('video/') ? (
                  <video src={preview} controls
                    style={{ width:'100%', maxHeight:180, objectFit:'cover' }}/>
                ) : (
                  <img src={preview} alt="Attachment"
                    style={{ width:'100%', maxHeight:180, objectFit:'cover' }}/>
                )}
                <div style={{ position:'absolute', top:8, right:8,
                  background:'rgba(0,0,0,0.7)', borderRadius:20,
                  padding:'4px 10px', fontSize:10, color:TEXT_2 }}
                  onClick={e => { e.preventDefault(); setFile(null); setPreview(null) }}>
                  Remove
                </div>
              </div>
            ) : (
              <div style={{ padding:'20px 16px', borderRadius:12, textAlign:'center',
                border:`1px dashed ${GOLD_BORDER}`, background:BG_CARD,
                color:TEXT_3, fontSize:12 }}>
                Tap to attach a photo or video
              </div>
            )}
          </label>
        </div>

        {/* Status */}
        {status && (
          <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:16,
            background:status.type==='success'?'rgba(93,191,106,0.1)':'rgba(207,95,95,0.1)',
            border:`0.5px solid ${status.type==='success'?'rgba(93,191,106,0.3)':'rgba(207,95,95,0.3)'}`,
            fontSize:12, color:status.type==='success'?GREEN:RED }}>
            {status.msg}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit}
          disabled={!title.trim() || !description.trim() || uploading}
          style={{ width:'100%', padding:'14px', borderRadius:12, border:'none',
            cursor:title&&description&&!uploading?'pointer':'default',
            background:title&&description&&!uploading?GOLD_DIM:'rgba(255,255,255,0.04)',
            borderWidth:1, borderStyle:'solid',
            borderColor:title&&description&&!uploading?GOLD:'rgba(255,255,255,0.08)',
            fontSize:13, fontWeight:600,
            color:title&&description&&!uploading?GOLD:TEXT_3 }}>
          {uploading ? 'Submitting…' : 'Submit Proposal'}
        </button>
      </div>
    </div>
  )
}