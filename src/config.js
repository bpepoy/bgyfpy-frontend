// src/config.js
// Central config — swap API_BASE for local dev vs production

export const API_BASE = import.meta.env.VITE_API_URL
  || 'https://bgyfpy-backend.onrender.com'

// League constants
export const LEAGUE_NAME  = 'BlackGold'
export const FIRST_SEASON = 2007
export const NUM_TEAMS    = 10

// Era definitions — must match backend ERAS dict
export const ERAS = [
  { key: 'all_time',    label: 'All-Time',   years: '2007–2025' },
  { key: 'darkness',    label: 'Darkness',   years: '2007–2009' },
  { key: 'sam_era',     label: 'Sam Era',    years: '2010–2013' },
  { key: 'frank_era',   label: 'Frank Era',  years: '2014–2017' },
  { key: 'jordan_era',  label: 'Jordan Era', years: '2018–2022' },
  { key: 'auction_era', label: 'Auction',    years: '2023–present' },
]

// Logged-in user — will come from auth context later
// Hardcoded for now during development
export const DEV_USER = {
  manager_id:   'brian',
  display_name: 'Brian',
  initials:     'BR',
}
