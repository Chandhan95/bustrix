import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { busApi } from '../api'
import toast from 'react-hot-toast'
import {
  FaBus, FaSearch, FaMapMarkerAlt,
  FaClock, FaChair, FaRupeeSign, FaWifi, FaSnowflake,
  FaArrowRight, FaCalendarAlt
} from 'react-icons/fa'
import CityAutocomplete from '../components/common/CityAutocomplete'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [sortBy, setSortBy] = useState('departureTime')
  const [filterType, setFilterType] = useState('ALL')

  const [form, setForm] = useState({
    source: searchParams.get('source') || '',
    destination: searchParams.get('destination') || '',
    travelDate: searchParams.get('date') || '',
    seats: searchParams.get('seats') || 1,
  })

  useEffect(() => {
    if (form.source && form.destination && form.travelDate) {
      doSearch()
    }
  }, [])

  const doSearch = async () => {
    if (!form.source || !form.destination || !form.travelDate) {
      toast.error('Please fill all search fields')
      return
    }
    setLoading(true)
    setSearched(true)
    try {
      const res = await busApi.search({
        source: form.source,
        destination: form.destination,
        travelDate: form.travelDate,
        seats: Number(form.seats),
      })
      setBuses(res.data.data || [])
    } catch (err) {
      toast.error('Search failed. Please try again.')
      setBuses([])
    } finally {
      setLoading(false)
    }
  }

  const filteredBuses = buses
    .filter(b => filterType === 'ALL' || b.busType === filterType)
    .sort((a, b) => {
      if (sortBy === 'price') return a.pricePerSeat - b.pricePerSeat
      if (sortBy === 'seats') return b.availableSeats - a.availableSeats
      return a.departureTime?.localeCompare(b.departureTime)
    })

  const fmtTime = (t) => {
    if (!t) return '--'
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const fmtDuration = (mins) => {
    if (!mins) return '--'
    return `${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const getBusTypeBadge = (type) => {
    const map = {
      AC_SEATER: 'badge-info', AC_SLEEPER: 'badge-info',
      SLEEPER: 'badge-warning', VOLVO: 'badge-success',
      LUXURY: 'badge-success', SEATER: 'badge-info',
      SEMI_SLEEPER: 'badge-warning',
    }
    return map[type] || 'badge-info'
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen pt-20 pb-12 bg-slate-50">
      <div className="page-container">

        {/* ── Search bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <CityAutocomplete
              id="search-source"
              value={form.source}
              onChange={val => setForm(f => ({ ...f, source: val }))}
              placeholder="From city..."
            />

            <CityAutocomplete
              id="search-destination"
              value={form.destination}
              onChange={val => setForm(f => ({ ...f, destination: val }))}
              placeholder="To city..."
            />

            <input type="date" min={today} value={form.travelDate}
              onChange={e => setForm(f => ({ ...f, travelDate: e.target.value }))}
              className="input-field text-sm" />

            <select value={form.seats} onChange={e => setForm(f => ({ ...f, seats: e.target.value }))}
              className="input-field text-sm">
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} seat{n > 1 ? 's' : ''}</option>)}
            </select>

            <button onClick={doSearch} disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 text-sm h-11">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><FaSearch /> Search</>
              }
            </button>
          </div>
        </motion.div>

        {/* ── Results header ── */}
        {searched && !loading && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {filteredBuses.length > 0
                  ? <>{filteredBuses.length} <span className="text-indigo-600">Buses Found</span></>
                  : <span className="text-slate-500">No buses found</span>
                }
              </h2>
              {form.source && form.destination && (
                <p className="text-slate-600 text-sm mt-1.5 flex items-center gap-2 font-medium">
                  <FaMapMarkerAlt className="text-emerald-500" /> {form.source}
                  <FaArrowRight className="text-slate-400" />
                  <FaMapMarkerAlt className="text-rose-500" /> {form.destination}
                  <span className="text-slate-300">·</span>
                  <FaCalendarAlt className="text-indigo-500" /> {form.travelDate}
                </p>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Sort */}
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650">
                <option value="departureTime">Sort: Departure Time</option>
                <option value="price">Sort: Price (Low to High)</option>
                <option value="seats">Sort: Available Seats</option>
              </select>

              {/* Bus type filter */}
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650">
                <option value="ALL">All Types</option>
                <option value="AC_SEATER">AC Seater</option>
                <option value="AC_SLEEPER">AC Sleeper</option>
                <option value="SLEEPER">Sleeper</option>
                <option value="VOLVO">Volvo</option>
                <option value="LUXURY">Luxury</option>
                <option value="SEATER">Seater</option>
              </select>
            </div>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-5 w-40 skeleton rounded" />
                  <div className="h-5 w-20 skeleton rounded" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[1,2,3,4].map(j => <div key={j} className="h-12 skeleton rounded-xl" />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── No results ── */}
        {searched && !loading && filteredBuses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-4">🚌</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">No buses found</h3>
            <p className="text-slate-500 max-w-sm mx-auto font-medium">
              No buses available for this route and date. Try a different date or route.
            </p>
          </motion.div>
        )}

        {/* ── Bus Cards ── */}
        <AnimatePresence>
          {filteredBuses.map((bus, i) => (
            <motion.div
              key={bus.scheduleId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover rounded-2xl p-6 mb-4 duration-300 group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                {/* Bus Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-650 font-bold shrink-0">
                      <FaBus className="text-indigo-600 text-base" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{bus.busName}</h3>
                      <p className="text-slate-500 text-xs font-semibold">{bus.busNumber}</p>
                    </div>
                    <span className={`badge ${getBusTypeBadge(bus.busType)}`}>
                      {bus.busType?.replace('_', ' ')}
                    </span>
                    {bus.amenities && bus.amenities.split(',').map((a, j) => (
                      <span key={j} className="text-slate-500 text-xs flex items-center gap-1 font-semibold">
                        {a.trim() === 'WiFi' && <FaWifi className="text-blue-500" />}
                        {a.trim() === 'AC' && <FaSnowflake className="text-cyan-500" />}
                        {a.trim() !== 'WiFi' && a.trim() !== 'AC' && <span className="text-slate-400">·</span>}
                        {a.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Route + Timings */}
                  <div className="flex items-center gap-6">
                    <div className="text-center min-w-[80px]">
                      <p className="text-2xl font-bold text-slate-850 text-slate-800">{fmtTime(bus.departureTime)}</p>
                      <p className="text-sm text-slate-500 font-semibold">{bus.source}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <p className="text-xs text-slate-500 mb-1 font-semibold">{fmtDuration(bus.durationMinutes)}</p>
                      <div className="w-full flex items-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <div className="flex-1 h-px bg-gradient-to-r from-emerald-500 to-rose-500" />
                        <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-bold">{bus.distanceKm} km</p>
                    </div>
                    <div className="text-center min-w-[80px]">
                      <p className="text-2xl font-bold text-slate-850 text-slate-800">{fmtTime(bus.arrivalTime)}</p>
                      <p className="text-sm text-slate-500 font-semibold">{bus.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Right section — price + booking */}
                <div className="flex lg:flex-col items-center justify-between lg:text-right gap-4 lg:min-w-[160px]">
                  <div>
                    <p className="text-3xl font-black text-indigo-600">
                      ₹{Number(bus.pricePerSeat).toLocaleString()}
                    </p>
                    <p className="text-slate-500 text-xs font-semibold">per seat</p>
                  </div>

                  <div className="text-center">
                    <div className={`flex items-center gap-1.5 mb-2 font-bold ${bus.availableSeats < 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      <FaChair className="text-sm animate-pulse" />
                      <span className="text-sm">{bus.availableSeats} seats left</span>
                    </div>
                    <button
                      onClick={() => navigate(`/seats/${bus.scheduleId}`, { state: { bus, form } })}
                      className="btn-primary !py-2.5 !px-6 text-sm whitespace-nowrap"
                    >
                      Select Seats →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Intro prompt */}
        {!searched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Search for Buses</h3>
            <p className="text-slate-500 font-medium">Enter your travel details above to find available buses</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
