// src/context/PhotoContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const API = 'https://bgyfpy-backend.onrender.com'

const PhotoContext = createContext({})

export function PhotoProvider({ children }) {
  const [photoMap, setPhotoMap] = useState({})

  useEffect(() => {
    fetch(`${API}/fantasy/teams/overview`)
      .then(r => r.json())
      .then(d => {
        const map = {}
        ;(d.managers || []).forEach(m => {
          if (m.photo_url) map[m.manager_id] = m.photo_url
        })
        setPhotoMap(map)
      })
      .catch(() => {})
  }, [])

  const updatePhoto = (managerId, photoUrl) => {
    setPhotoMap(prev => ({ ...prev, [managerId]: photoUrl }))
  }

  return (
    <PhotoContext.Provider value={{ photoMap, updatePhoto }}>
      {children}
    </PhotoContext.Provider>
  )
}

// Hook any component can call
export function usePhoto(managerId) {
  const { photoMap } = useContext(PhotoContext)
  return photoMap[managerId] || null
}

// Hook to update a photo (used after profile upload)
export function useUpdatePhoto() {
  const { updatePhoto } = useContext(PhotoContext)
  return updatePhoto
}