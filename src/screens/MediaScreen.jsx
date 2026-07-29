// src/screens/MediaScreen.jsx
import { useState, useEffect, useRef } from 'react'

// Generate video thumbnail from Cloudinary video URL
function getVideoThumb(url) {
  if (!url) return null
  // Replace /upload/ with /upload/so_0/ and change extension to .jpg
  try {
    return url
      .replace('/upload/', '/upload/so_0,w_400,h_400,c_fill/')
      .replace(/\.(mp4|mov|webm|avi)$/i, '.jpg')
  } catch { return null }
}

const API         = 'https://bgyfpy-backend.onrender.com'
const GOLD        = '#D4A843'
const GOLD_DIM    = 'rgba(212,168,67,0.15)'
const GOLD_BORDER = 'rgba(212,168,67,0.3)'
const BG_APP      = '#0f0f0f'
const BG_CARD     = '#1e1e1e'
const BG_SURFACE  = '#171717'
const TEXT_1      = '#F0E6CC'
const TEXT_2      = '#A89060'
const TEXT_3      = '#967843'
const GREEN       = '#5DBF6A'

const INITIALS = {
  blake:'BJ', brian:'BP', frank:'FL', jake:'JK',
  joey:'JY', jordan:'JM', kyle:'KB', nick:'ND', rob:'RD', zef:'ZD'
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Avatar({ managerId, size=24 }) {
  const ini = INITIALS[managerId] || managerId?.slice(0,2).toUpperCase() || '?'
  return (
    <div style={{ width:size, height:size, borderRadius:'50%',
      border:`1.5px solid ${GOLD_BORDER}`, flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:GOLD_DIM, fontSize:size*0.3, fontWeight:500, color:GOLD }}>
      {ini}
    </div>
  )
}

function StarRating({ rating, max=10 }) {
  if (rating == null) return null
  const pct = (rating / max) * 100
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ flex:1, height:4, borderRadius:2,
        background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', borderRadius:2, background:GOLD }}/>
      </div>
      <span style={{ fontSize:11, fontWeight:600, color:GOLD, flexShrink:0 }}>
        {parseFloat(rating).toFixed(1)}
      </span>
    </div>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ items, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx)
  const item = items[idx]
  const touchStart = useRef(null)

  const prev = () => setIdx(i => Math.max(0, i-1))
  const next = () => setIdx(i => Math.min(items.length-1, i+1))

  const onTouchStart = e => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd   = e => {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    touchStart.current = null
  }

  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!item) return null
  const isVideo = item.media_type === 'video'

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ position:'fixed', inset:0, zIndex:300,
        background:'rgba(0,0,0,0.97)', display:'flex', flexDirection:'column' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 16px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Avatar managerId={item.uploaded_by} size={28}/>
          <div>
            <div style={{ fontSize:12, color:TEXT_1 }}>
              {INITIALS[item.uploaded_by]||item.uploaded_by}
            </div>
            <div style={{ fontSize:9, color:TEXT_3 }}>{item.media_date || ''}</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:10, color:TEXT_3 }}>{idx+1} / {items.length}</span>
          <button onClick={onClose} style={{ background:'none', border:'none',
            color:TEXT_2, fontSize:24, cursor:'pointer', padding:4 }}>✕</button>
        </div>
      </div>

      {/* Media */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
        position:'relative', overflow:'hidden' }}>
        {/* Prev arrow */}
        {idx > 0 && (
          <button onClick={prev} style={{ position:'absolute', left:12, zIndex:10,
            background:'rgba(0,0,0,0.5)', border:'none', color:TEXT_2,
            fontSize:22, cursor:'pointer', borderRadius:8, padding:'8px 12px' }}>‹</button>
        )}
        {isVideo ? (
          <video controls autoPlay style={{ maxWidth:'100%', maxHeight:'100%',
            objectFit:'contain' }} src={item.cloudinary_url}/>
        ) : (
          <img src={item.cloudinary_url} alt=""
            style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }}/>
        )}
        {/* Next arrow */}
        {idx < items.length-1 && (
          <button onClick={next} style={{ position:'absolute', right:12, zIndex:10,
            background:'rgba(0,0,0,0.5)', border:'none', color:TEXT_2,
            fontSize:22, cursor:'pointer', borderRadius:8, padding:'8px 12px' }}>›</button>
        )}
      </div>

      {/* Food review details */}
      {item.category === 'food_review' && (
        <div style={{ padding:'12px 16px', background:'rgba(0,0,0,0.6)',
          borderTop:`0.5px solid ${GOLD_BORDER}`, flexShrink:0 }}>
          {item.restaurant && (
            <div style={{ fontSize:13, fontWeight:500, color:GOLD, marginBottom:4 }}>
              {item.restaurant}
            </div>
          )}
          {item.menu_item && (
            <div style={{ fontSize:11, color:TEXT_2, marginBottom:6 }}>{item.menu_item}</div>
          )}
          {item.rating != null && (
            <div style={{ marginBottom:6 }}>
              <StarRating rating={item.rating}/>
            </div>
          )}
          {item.review_text && (
            <div style={{ fontSize:11, color:TEXT_1, lineHeight:1.5 }}>{item.review_text}</div>
          )}
        </div>
      )}

      {/* Tags */}
      {item.tags?.length > 0 && (
        <div style={{ display:'flex', gap:6, padding:'8px 16px',
          flexShrink:0, flexWrap:'wrap' }}>
          {item.tags.map(t => (
            <span key={t} style={{ fontSize:9, color:TEXT_3,
              background:'rgba(255,255,255,0.06)', borderRadius:10,
              padding:'2px 8px' }}>#{t}</span>
          ))}
        </div>
      )}

      {/* Swipe hint */}
      <div style={{ padding:'6px 0 12px', textAlign:'center',
        fontSize:9, color:TEXT_3, flexShrink:0 }}>
        Swipe left/right to browse
      </div>
    </div>
  )
}

// ── Filter sheet ──────────────────────────────────────────────────────────────
function FilterSheet({ open, onClose, filters, onChange, category, uploaders=[], restaurants=[] }) {
  if (!open) return null
  const years = []
  for (let y = new Date().getFullYear(); y >= 2007; y--) years.push(y)

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0,
        background:'rgba(0,0,0,0.6)', zIndex:100 }}/>
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:110,
        background:'#111', borderRadius:'16px 16px 0 0',
        border:`0.5px solid ${GOLD_BORDER}`, padding:'16px 16px 32px',
        maxHeight:'70vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'center', marginBottom:16 }}>
          <span style={{ fontSize:13, fontWeight:500, color:GOLD }}>FILTERS</span>
          <button onClick={onClose} style={{ background:'none', border:'none',
            color:TEXT_2, fontSize:20, cursor:'pointer' }}>✕</button>
        </div>

        {/* Sort */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', marginBottom:8 }}>
            SORT ORDER
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {[{k:'newest',l:'Newest First'},{k:'oldest',l:'Oldest First'}].map(o => (
              <button key={o.k} onClick={() => onChange({...filters, sort:o.k})}
                style={{ flex:1, padding:'8px', borderRadius:8, border:'none', cursor:'pointer',
                  background:filters.sort===o.k?GOLD_DIM:'rgba(255,255,255,0.04)',
                  borderWidth:filters.sort===o.k?1:0.5, borderStyle:'solid',
                  borderColor:filters.sort===o.k?GOLD:'rgba(255,255,255,0.06)',
                  fontSize:11, color:filters.sort===o.k?GOLD:TEXT_3 }}>
                {o.l}
              </button>
            ))}
          </div>
        </div>

        {/* Year */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', marginBottom:8 }}>
            YEAR
          </div>
          <select value={filters.year||''}
            onChange={e => onChange({...filters, year:e.target.value||null})}
            style={{ width:'100%', padding:'8px 10px', borderRadius:8,
              border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
              color:TEXT_1, fontSize:12, cursor:'pointer' }}>
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Uploader */}
        {(category === 'ice_video' || category === 'food_review' || category === 'punishment') && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', marginBottom:8 }}>
              UPLOADED BY
            </div>
            <select value={filters.uploaded_by||''}
              onChange={e => onChange({...filters, uploaded_by:e.target.value||null})}
              style={{ width:'100%', padding:'8px 10px', borderRadius:8,
                border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
                color:TEXT_1, fontSize:12, cursor:'pointer' }}>
              <option value="">All Members</option>
              {uploaders.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        )}

        {/* Restaurant */}
        {category === 'food_review' && restaurants.length > 0 && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:9, color:TEXT_3, letterSpacing:'0.1em', marginBottom:8 }}>
              RESTAURANT
            </div>
            <select value={filters.restaurant||''}
              onChange={e => onChange({...filters, restaurant:e.target.value||null})}
              style={{ width:'100%', padding:'8px 10px', borderRadius:8,
                border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
                color:TEXT_1, fontSize:12, cursor:'pointer' }}>
              <option value="">All Restaurants</option>
              {restaurants.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        )}

        {/* Reset */}
        <button onClick={() => onChange({ sort:'newest', year:null, uploaded_by:null, restaurant:null })}
          style={{ width:'100%', padding:'10px', borderRadius:8, border:'none',
            cursor:'pointer', background:'rgba(255,255,255,0.06)',
            fontSize:11, color:TEXT_3, marginTop:4 }}>
          Reset Filters
        </button>
      </div>
    </>
  )
}

// ── Media grid ────────────────────────────────────────────────────────────────
function MediaGrid({ items, onTap }) {
  if (!items.length) return (
    <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>
      No media found.
    </div>
  )
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)',
      gap:2, padding:'2px' }}>
      {items.map((item, i) => (
        <div key={item.id||i} onClick={() => onTap(i)}
          style={{ position:'relative', aspectRatio:'1', overflow:'hidden',
            cursor:'pointer', background:BG_CARD }}>
          {item.media_type === 'video' ? (
            <>
              {getVideoThumb(item.cloudinary_url) ? (
                <img src={getVideoThumb(item.cloudinary_url)} alt=""
                  style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              ) : (
                <video src={item.cloudinary_url} muted playsInline preload="metadata"
                  style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              )}
              <div style={{ position:'absolute', top:'50%', left:'50%',
                transform:'translate(-50%,-50%)',
                background:'rgba(0,0,0,0.6)', borderRadius:'50%',
                width:28, height:28, display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:10, color:'white' }}>▶</div>
            </>
          ) : (
            <img src={item.cloudinary_url} alt=""
              style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          )}
          {/* Food review rating badge */}
          {item.category === 'food_review' && item.rating != null && (
            <div style={{ position:'absolute', bottom:4, right:4,
              background:'rgba(0,0,0,0.75)', borderRadius:6,
              padding:'2px 5px', fontSize:9, fontWeight:600, color:GOLD }}>
              {parseFloat(item.rating).toFixed(1)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Food review list view ─────────────────────────────────────────────────────
function FoodReviewList({ items, onTap }) {
  if (!items.length) return (
    <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>
      No food reviews yet.
    </div>
  )
  return (
    <div style={{ padding:'0 0 16px' }}>
      {items.map((item, i) => (
        <div key={item.id||i} onClick={() => onTap(i)}
          style={{ display:'flex', gap:12, padding:'12px 14px',
            borderBottom:`0.5px solid rgba(212,168,67,0.08)`,
            cursor:'pointer', alignItems:'flex-start' }}>
          {/* Thumbnail */}
          <div style={{ width:72, height:72, borderRadius:8, overflow:'hidden',
            flexShrink:0, background:BG_CARD, position:'relative' }}>
            {item.media_type === 'video' ? (
              <>
                {getVideoThumb(item.cloudinary_url) ? (
                  <img src={getVideoThumb(item.cloudinary_url)} alt=""
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                ) : (
                  <video src={item.cloudinary_url} muted preload="metadata"
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                )}
                <div style={{ position:'absolute', inset:0, display:'flex',
                  alignItems:'center', justifyContent:'center',
                  background:'rgba(0,0,0,0.4)', fontSize:16, color:'white' }}>▶</div>
              </>
            ) : (
              <img src={item.cloudinary_url} alt=""
                style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            )}
          </div>
          {/* Details */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:500, color:TEXT_1, marginBottom:2 }}>
              {item.restaurant || 'Unknown Restaurant'}
            </div>
            {item.menu_item && (
              <div style={{ fontSize:11, color:TEXT_2, marginBottom:4 }}>{item.menu_item}</div>
            )}
            {item.rating != null && (
              <StarRating rating={item.rating}/>
            )}
            {item.review_text && (
              <div style={{ fontSize:10, color:TEXT_2, marginTop:5, lineHeight:1.5,
                overflow:'hidden', textOverflow:'ellipsis',
                display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                "{item.review_text}"
              </div>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
              <Avatar managerId={item.uploaded_by} size={16}/>
              <span style={{ fontSize:9, color:TEXT_3 }}>{item.media_date||''}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Individual tabs ───────────────────────────────────────────────────────────

function useMediaFetch(endpoint, filters, deps=[]) {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.sort)        params.set('sort', filters.sort)
    if (filters.year)        params.set('year', filters.year)
    if (filters.uploaded_by) params.set('uploaded_by', filters.uploaded_by)
    if (filters.restaurant)  params.set('restaurant', filters.restaurant)
    fetch(`${API}${endpoint}?${params}`)
      .then(r => r.json())
      .then(d => { setItems(d.items||[]); setLoading(false) })
      .catch(() => setLoading(false))
  }, [endpoint, filters.sort, filters.year, filters.uploaded_by, filters.restaurant, ...deps])

  return { items, loading }
}

function ContentTab() {
  const [tag, setTag]         = useState('all')
  const [filters, setFilters] = useState({ sort:'newest', year:null })
  const [filterOpen, setFilterOpen] = useState(false)
  const [lightbox, setLightbox]     = useState(null)

  const { items, loading } = useMediaFetch('/media/content',
    { ...filters, tag: tag !== 'all' ? tag : null })

  const TAGS = [
    { k:'all',           l:'All' },
    { k:'draft_weekend', l:'Draft Wknd' },
    { k:'meme',          l:'Memes' },
    { k:'faceswap',      l:'Faceswap' },
    { k:'extra',         l:'Extra' },
  ]

  return (
    <>
      {lightbox !== null && (
        <Lightbox items={items} startIdx={lightbox} onClose={() => setLightbox(null)}/>
      )}
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)}
        filters={filters} onChange={setFilters} category="content"/>

      {/* Tag toggle */}
      <div style={{ display:'flex', gap:6, padding:'10px 14px 4px', overflowX:'auto' }}>
        {TAGS.map(t => (
          <button key={t.k} onClick={() => setTag(t.k)}
            style={{ padding:'5px 12px', borderRadius:14, border:'none', cursor:'pointer',
              background:tag===t.k?GOLD_DIM:'rgba(255,255,255,0.04)',
              borderWidth:tag===t.k?1:0.5, borderStyle:'solid',
              borderColor:tag===t.k?GOLD:'rgba(255,255,255,0.06)',
              fontSize:10, color:tag===t.k?GOLD:TEXT_3,
              fontWeight:tag===t.k?600:400, flexShrink:0, whiteSpace:'nowrap' }}>
            {t.l}
          </button>
        ))}
        <button onClick={() => setFilterOpen(true)}
          style={{ marginLeft:'auto', padding:'5px 10px', borderRadius:14,
            border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
            fontSize:10, color:GOLD, cursor:'pointer', flexShrink:0 }}>
          ⚙ Filter
        </button>
      </div>

      {loading
        ? <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>Loading…</div>
        : <MediaGrid items={items} onTap={i => setLightbox(i)}/>
      }
    </>
  )
}

function PunishmentTab() {
  const [filters, setFilters]   = useState({ sort:'newest', year:null })
  const [filterOpen, setFilterOpen] = useState(false)
  const [lightbox, setLightbox]     = useState(null)
  const { items, loading }          = useMediaFetch('/media/punishment', filters)
  const uploaders = [...new Set(items.map(i => i.uploaded_by).filter(Boolean))]

  return (
    <>
      {lightbox !== null && (
        <Lightbox items={items} startIdx={lightbox} onClose={() => setLightbox(null)}/>
      )}
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)}
        filters={filters} onChange={setFilters} category="punishment" uploaders={uploaders}/>

      <div style={{ display:'flex', justifyContent:'flex-end', padding:'10px 14px 4px' }}>
        <button onClick={() => setFilterOpen(true)}
          style={{ padding:'5px 12px', borderRadius:14,
            border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
            fontSize:10, color:GOLD, cursor:'pointer' }}>
          ⚙ Filter
        </button>
      </div>

      {loading
        ? <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>Loading…</div>
        : <MediaGrid items={items} onTap={i => setLightbox(i)}/>
      }
    </>
  )
}

function IceVideosTab() {
  const [filters, setFilters]   = useState({ sort:'newest', year:null, uploaded_by:null })
  const [filterOpen, setFilterOpen] = useState(false)
  const [lightbox, setLightbox]     = useState(null)
  const { items, loading }          = useMediaFetch('/media/ice-videos', filters)
  const uploaders = [...new Set(items.map(i => i.uploaded_by).filter(Boolean))]

  return (
    <>
      {lightbox !== null && (
        <Lightbox items={items} startIdx={lightbox} onClose={() => setLightbox(null)}/>
      )}
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)}
        filters={filters} onChange={setFilters} category="ice_video" uploaders={uploaders}/>

      <div style={{ display:'flex', justifyContent:'flex-end', padding:'10px 14px 4px' }}>
        <button onClick={() => setFilterOpen(true)}
          style={{ padding:'5px 12px', borderRadius:14,
            border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
            fontSize:10, color:GOLD, cursor:'pointer' }}>
          ⚙ Filter
        </button>
      </div>

      {loading
        ? <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>Loading…</div>
        : <MediaGrid items={items} onTap={i => setLightbox(i)}/>
      }
    </>
  )
}

function FoodReviewsTab() {
  const [filters, setFilters]   = useState({ sort:'newest', year:null, uploaded_by:null, restaurant:null })
  const [filterOpen, setFilterOpen] = useState(false)
  const [lightbox, setLightbox]     = useState(null)
  const { items, loading }          = useMediaFetch('/media/food-reviews', filters)
  const uploaders   = [...new Set(items.map(i => i.uploaded_by).filter(Boolean))]
  const restaurants = [...new Set(items.map(i => i.restaurant).filter(Boolean))].sort()

  return (
    <>
      {lightbox !== null && (
        <Lightbox items={items} startIdx={lightbox} onClose={() => setLightbox(null)}/>
      )}
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)}
        filters={filters} onChange={setFilters} category="food_review"
        uploaders={uploaders} restaurants={restaurants}/>

      <div style={{ display:'flex', justifyContent:'flex-end', padding:'10px 14px 4px' }}>
        <button onClick={() => setFilterOpen(true)}
          style={{ padding:'5px 12px', borderRadius:14,
            border:`0.5px solid ${GOLD_BORDER}`, background:BG_CARD,
            fontSize:10, color:GOLD, cursor:'pointer' }}>
          ⚙ Filter
        </button>
      </div>

      {loading
        ? <div style={{ padding:40, textAlign:'center', color:TEXT_3, fontSize:12 }}>Loading…</div>
        : <FoodReviewList items={items} onTap={i => setLightbox(i)}/>
      }
    </>
  )
}

// ── Bottom nav for media ──────────────────────────────────────────────────────
const MEDIA_TABS = [
  { key:'content',     label:'Content',    icon:'/icons/media-icon.png'      },
  { key:'punishment',  label:'Punishment', icon:'/icons/punishment-icon.png' },
  { key:'ice-videos',  label:'Ice Videos', icon:'/icons/ice-video-icon.png'  },
  { key:'food-reviews',label:'Food',       icon:'/icons/food-review-icon.png'},
]

function MediaBottomNav({ active, onTab }) {
  return (
    <div style={{ display:'flex', alignItems:'center', flexShrink:0,
      height:72, background:BG_SURFACE,
      borderTop:`0.5px solid rgba(212,168,67,0.45)`,
      padding:'0 6px',
      paddingBottom:'env(safe-area-inset-bottom, 0px)' }}>
      {MEDIA_TABS.map(tab => {
        const isActive = active === tab.key
        return (
          <button key={tab.key} onClick={() => onTab(tab.key)}
            className="flex flex-col items-center gap-1"
            style={{ flex:1 }} aria-label={tab.label}>
            <div style={{ width:36, height:36, borderRadius:8,
              background:isActive?GOLD_DIM:'transparent',
              display:'flex', alignItems:'center', justifyContent:'center',
              border:isActive?`1.5px solid ${GOLD}`:`0.5px solid ${GOLD_BORDER}`,
              position:'relative' }}>
              <img src={tab.icon} alt={tab.label}
                style={{ width:20, height:20, objectFit:'contain',
                  opacity:isActive?1:0.4 }}/>
              {isActive && (
                <div style={{ position:'absolute', width:4, height:4,
                  background:GOLD, borderRadius:'50%',
                  bottom:-8, left:'50%', transform:'translateX(-50%)' }}/>
              )}
            </div>
            <span style={{ fontSize:7, letterSpacing:'0.06em',
              textTransform:'uppercase',
              color:isActive?GOLD:TEXT_3 }}>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function MediaScreen() {
  const [activeTab, setActiveTab] = useState('content')

  return (
    <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, overflowY:'auto' }}>
        {activeTab === 'content'      && <ContentTab/>}
        {activeTab === 'punishment'   && <PunishmentTab/>}
        {activeTab === 'ice-videos'   && <IceVideosTab/>}
        {activeTab === 'food-reviews' && <FoodReviewsTab/>}
      </div>
      <MediaBottomNav active={activeTab} onTab={setActiveTab}/>
    </div>
  )
}