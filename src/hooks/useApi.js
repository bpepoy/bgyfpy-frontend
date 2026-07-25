// src/hooks/useApi.js
// Shared data fetching hook — handles loading, error, and caching

import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../config'

// Simple in-memory cache keyed by URL
const cache = {}

export function useApi(path, options = {}) {
  const { skip = false } = options
  const url = path ? `${API_BASE}${path}` : null

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(!skip && !!url)
  const [error,   setError]   = useState(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (!url || skip) {
      setLoading(false)
      return
    }

    // Return cached result immediately
    if (cache[url]) {
      setData(cache[url])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setError(null)

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        return res.json()
      })
      .then(json => {
        cache[url] = json
        setData(json)
        setLoading(false)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setLoading(false)
      })

    return () => controller.abort()
  }, [url, skip])

  const refetch = () => {
    delete cache[url]
    setData(null)
    setLoading(true)
    setError(null)
  }

  return { data, loading, error, refetch }
}
