// src/components/Avatar.jsx
// Shared avatar component — auto-loads photo from PhotoContext
import { usePhoto } from '../context/PhotoContext'

const INITIALS = {
  blake:'BJ', brian:'BP', frank:'FL', jake:'JK', joey:'JY',
  jordan:'JM', kyle:'KB', nick:'ND', rob:'RD', zef:'ZD'
}

const GOLD        = '#D4A843'
const GOLD_DIM    = 'rgba(212,168,67,0.15)'
const GOLD_BORDER = 'rgba(212,168,67,0.3)'

export default function Avatar({ managerId, photoUrl, size = 32, style = {} }) {
  // Use passed photoUrl, or look up from context, or fall back to initials
  const contextPhoto = usePhoto(managerId)
  const photo = photoUrl || contextPhoto
  const ini   = INITIALS[managerId] || managerId?.slice(0,2).toUpperCase() || '?'

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1.5px solid ${GOLD_BORDER}`,
      overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: photo ? 'transparent' : GOLD_DIM,
      fontSize: size * 0.3, fontWeight: 500, color: GOLD,
      ...style,
    }}>
      {photo
        ? <img src={photo} alt={managerId}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        : ini
      }
    </div>
  )
}