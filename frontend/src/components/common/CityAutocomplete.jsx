import { useState, useEffect, useRef, useCallback } from 'react'
import { FaMapMarkerAlt, FaTimes, FaSearch } from 'react-icons/fa'

// Comprehensive list of Indian cities for bus travel
const INDIAN_CITIES = [
  "Agra", "Ahmedabad", "Ajmer", "Allahabad", "Amritsar", "Aurangabad",
  "Bangalore", "Belgaum", "Bhopal", "Bhubaneswar", "Chandigarh", "Chennai",
  "Coimbatore", "Dehradun", "Delhi", "Dhanbad", "Faridabad", "Ghaziabad",
  "Goa", "Gorakhpur", "Gurgaon", "Guwahati", "Gwalior", "Hubli",
  "Hyderabad", "Indore", "Jaipur", "Jalandhar", "Jammu", "Jodhpur",
  "Kanpur", "Kochi", "Kolkata", "Kota", "Lucknow", "Ludhiana",
  "Madurai", "Mangalore", "Meerut", "Mumbai", "Mysore", "Nagpur",
  "Nashik", "Noida", "Patna", "Pondicherry", "Pune", "Raipur",
  "Rajkot", "Ranchi", "Surat", "Thiruvananthapuram", "Tiruchirappalli",
  "Udaipur", "Vadodara", "Varanasi", "Vijayawada", "Visakhapatnam",
  // Additional cities
  "Agartala", "Bhilai", "Bikaner", "Cuttack", "Dhule", "Erode",
  "Guntur", "Hassan", "Haridwar", "Hubli", "Imphal", "Itanagar",
  "Jabalpur", "Jamnagar", "Jhansi", "Kolhapur", "Latur", "Malegaon",
  "Moradabad", "Muzaffarnagar", "Muzaffarpur", "Nanded", "Nellore",
  "Nizamabad", "Pimpri", "Puducherry", "Salem", "Saharanpur", "Siliguri",
  "Solapur", "Tirunelveli", "Tirupati", "Tiruppur", "Ujjain", "Warangal"
].sort()

export default function CityAutocomplete({
  value,
  onChange,
  placeholder = 'Search city...',
  label,
  id,
  error,
  icon
}) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const [fetchedCities, setFetchedCities] = useState([])
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Try to fetch more cities from online API once
  useEffect(() => {
    const cached = sessionStorage.getItem('bustix_cities')
    if (cached) {
      setFetchedCities(JSON.parse(cached))
      return
    }
    fetch('https://countriesnow.space/api/v0.1/countries/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'India' }),
      signal: AbortSignal.timeout(4000)
    })
      .then(r => r.json())
      .then(data => {
        if (data?.data?.length) {
          const cities = data.data.sort()
          sessionStorage.setItem('bustix_cities', JSON.stringify(cities))
          setFetchedCities(cities)
        }
      })
      .catch(() => { /* use local list */ })
  }, [])

  const allCities = fetchedCities.length > 0 ? fetchedCities : INDIAN_CITIES

  const filter = useCallback((q) => {
    if (!q || q.length < 1) return []
    const lq = q.toLowerCase()
    return allCities
      .filter(c => c.toLowerCase().includes(lq))
      .slice(0, 10)
  }, [allCities])

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  const handleInput = (e) => {
    const q = e.target.value
    setQuery(q)
    const results = filter(q)
    setSuggestions(results)
    setOpen(results.length > 0)
    setHighlightIdx(-1)
    if (!q) onChange('')
  }

  const handleSelect = (city) => {
    setQuery(city)
    onChange(city)
    setSuggestions([])
    setOpen(false)
    setHighlightIdx(-1)
  }

  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIdx >= 0 && suggestions[highlightIdx]) {
        handleSelect(suggestions[highlightIdx])
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full">
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query && suggestions.length > 0) setOpen(true)
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={`input-field text-sm font-medium ${icon ? 'pl-10' : ''} ${query ? 'pr-10' : ''} ${error ? 'border-red-400' : ''}`}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); onChange(''); setSuggestions([]); setOpen(false); inputRef.current?.focus() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((city, i) => (
            <button
              key={city}
              type="button"
              onMouseDown={() => handleSelect(city)}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 transition-colors ${
                i === highlightIdx
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FaMapMarkerAlt className={`text-xs shrink-0 ${i === highlightIdx ? 'text-indigo-500' : 'text-slate-400'}`} />
              {city}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1 font-semibold">{error}</p>}
    </div>
  )
}
