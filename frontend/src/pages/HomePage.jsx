import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaBus, FaSearch, FaShieldAlt, FaBolt, FaTicketAlt,
  FaMapMarkerAlt, FaCalendarAlt, FaUsers,
  FaWifi, FaSnowflake, FaMobileAlt, FaChevronRight, FaStar
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import CityAutocomplete from '../components/common/CityAutocomplete'

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.08 } } }

export default function HomePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    source: '', destination: '', travelDate: '', seats: 1
  })
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!form.source || !form.destination || !form.travelDate) {
      toast.error('Please fill all search fields')
      return
    }
    if (form.source === form.destination) {
      toast.error('Source and destination cannot be same')
      return
    }
    setLoading(true)
    navigate(`/search?source=${form.source}&destination=${form.destination}&date=${form.travelDate}&seats=${form.seats}`)
  }



  const stats = [
    { label: 'Happy Travellers', value: '2M+', icon: <FaUsers /> },
    { label: 'Bus Operators', value: '500+', icon: <FaBus /> },
    { label: 'Routes', value: '5000+', icon: <FaMapMarkerAlt /> },
    { label: 'Cities', value: '1000+', icon: <FaTicketAlt /> },
  ]

  const features = [
    { icon: <FaSearch />, title: 'Easy Search', desc: 'Search buses across hundreds of routes in seconds with real-time availability', color: 'bg-blue-50 text-blue-600 border border-blue-100' },
    { icon: <FaShieldAlt />, title: 'Secure Booking', desc: 'Bank-grade security with JWT authentication and encrypted payments', color: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
    { icon: <FaBolt />, title: 'Instant Confirmation', desc: 'Get your QR code ticket instantly via email after booking confirmation', color: 'bg-amber-50 text-amber-600 border border-amber-100' },
    { icon: <FaWifi />, title: 'Premium Amenities', desc: 'Choose buses with WiFi, AC, USB charging, and gourmet snacks onboard', color: 'bg-purple-50 text-purple-600 border border-purple-100' },
    { icon: <FaSnowflake />, title: 'AC & Non-AC', desc: 'Wide range of bus types — Sleeper, Volvo, Luxury, Seater for every budget', color: 'bg-cyan-50 text-cyan-600 border border-cyan-100' },
    { icon: <FaMobileAlt />, title: 'QR Boarding', desc: 'Paperless boarding with QR code tickets right on your smartphone', color: 'bg-rose-50 text-rose-600 border border-rose-100' },
  ]

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen">
      {/* ─── HERO SECTION ─────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-slate-50 border-b border-slate-200/50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-50 to-transparent" />
        </div>

        <div className="relative z-10 page-container text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 badge badge-info mb-6 px-4 py-1.5 text-sm font-semibold">
              <FaBus className="text-indigo-600 animate-pulse" />
              India's #1 Bus Booking Platform
            </span>

            <h1 className="font-display font-black text-5xl md:text-7xl mb-6 leading-tight text-slate-800 tracking-tight">
              Travel Smart, <span className="text-indigo-600">Travel Safe</span>
            </h1>

            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Book bus tickets in seconds. Choose your seat. Get your QR ticket. Simple & secure.
            </p>

            {/* ─── SEARCH BOX ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-4xl mx-auto border border-slate-200 shadow-lg"
            >
              <h2 className="text-left text-lg font-bold text-slate-700 mb-5 flex items-center gap-2">
                <FaSearch className="text-indigo-600" />
                Find Your Bus
              </h2>
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Source */}
                  <div>
                    <label className="input-label flex items-center gap-1.5 font-semibold text-slate-600">
                      <FaMapMarkerAlt className="text-emerald-500 text-xs" /> From
                    </label>
                    <CityAutocomplete
                      id="home-source"
                      value={form.source}
                      onChange={val => setForm(f => ({ ...f, source: val }))}
                      placeholder="Type source city..."
                    />
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="input-label flex items-center gap-1.5 font-semibold text-slate-600">
                      <FaMapMarkerAlt className="text-rose-500 text-xs" /> To
                    </label>
                    <CityAutocomplete
                      id="home-destination"
                      value={form.destination}
                      onChange={val => setForm(f => ({ ...f, destination: val }))}
                      placeholder="Type destination city..."
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="input-label flex items-center gap-1.5 font-semibold text-slate-600">
                      <FaCalendarAlt className="text-indigo-500 text-xs" /> Travel Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={form.travelDate}
                      onChange={e => setForm(f => ({ ...f, travelDate: e.target.value }))}
                      className="input-field text-sm font-medium bg-white"
                      required
                    />
                  </div>

                  {/* Seats */}
                  <div>
                    <label className="input-label flex items-center gap-1.5 font-semibold text-slate-600">
                      <FaUsers className="text-violet-500 text-xs" /> Passengers
                    </label>
                    <select
                      value={form.seats}
                      onChange={e => setForm(f => ({ ...f, seats: e.target.value }))}
                      className="input-field text-sm font-medium bg-white"
                    >
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Seat{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base flex items-center justify-center gap-3">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaSearch />
                      Search Available Buses
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS SECTION ───────────────────────────────── */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="page-container">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div key={i} variants={fadeUp} className="stat-card text-center !border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-lg mx-auto mb-3 shadow-sm border border-indigo-100/50">
                  {stat.icon}
                </div>
                <div className="font-display font-black text-2xl text-slate-800 mb-0.5">{stat.value}</div>
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─────────────────────────────── */}
      <section className="py-16 bg-slate-50/50">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="font-display font-black text-3xl md:text-4xl mb-3 text-slate-800 tracking-tight">
              Why Choose BusTix?
            </h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto font-medium">
              Everything you need for a seamless travel experience, all in one place.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="glass-card-hover rounded-2xl p-6 !border-slate-200/60 shadow-sm"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg mb-4 shadow-sm ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── POPULAR ROUTES ───────────────────────────────── */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display font-black text-3xl text-slate-800 tracking-tight mb-3">Popular Routes</h2>
            <p className="text-slate-500 font-medium">Top travel routes booked by thousands every day</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              { from: 'Mumbai', to: 'Pune', price: '₹299', duration: '3h', rating: 4.8 },
              { from: 'Delhi', to: 'Jaipur', price: '₹449', duration: '5h', rating: 4.7 },
              { from: 'Bangalore', to: 'Chennai', price: '₹599', duration: '6h', rating: 4.9 },
              { from: 'Hyderabad', to: 'Bangalore', price: '₹799', duration: '8h', rating: 4.6 },
              { from: 'Mumbai', to: 'Ahmedabad', price: '₹699', duration: '7h', rating: 4.5 },
              { from: 'Delhi', to: 'Agra', price: '₹349', duration: '4h', rating: 4.8 },
            ].map((r, i) => (
              <motion.button
                key={i}
                variants={fadeUp}
                onClick={() => {
                  const today = new Date()
                  today.setDate(today.getDate() + 1)
                  navigate(`/search?source=${r.from}&destination=${r.to}&date=${today.toISOString().split('T')[0]}&seats=1`)
                }}
                className="bus-card text-left hover:border-indigo-500/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-800">{r.from}</span>
                    <span className="text-slate-400 font-bold">→</span>
                    <span className="text-base font-bold text-slate-800">{r.to}</span>
                  </div>
                  <FaChevronRight className="text-slate-400 text-xs" />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>From {r.price}</span>
                  <span>{r.duration}</span>
                  <span className="flex items-center gap-1 text-amber-500">
                    <FaStar className="text-[10px]" /> {r.rating}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA SECTION ──────────────────────────────────── */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/50">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-indigo-650 text-center p-12 md:p-16 rounded-3xl relative overflow-hidden bg-indigo-600 shadow-lg border border-indigo-700"
          >
            <div className="relative z-10 text-white">
              <h2 className="font-display font-black text-3xl md:text-5xl mb-4 text-white tracking-tight">
                Ready to Hit the Road? 🚌
              </h2>
              <p className="text-indigo-100 text-base md:text-lg max-w-xl mx-auto mb-8 font-medium">
                Join 2 million+ travelers who trust BusTix for their journeys. Book now and save!
              </p>
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center max-w-md mx-auto">
                <button
                  onClick={() => navigate('/search')}
                  className="bg-white text-indigo-700 font-bold px-7 py-3.5 rounded-2xl hover:bg-slate-50 transition-all hover:scale-102 shadow-sm text-sm"
                >
                  Search Buses Now
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white border border-indigo-500 font-bold px-7 py-3.5 rounded-2xl transition-all text-sm"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="page-container text-center text-slate-500 text-sm font-medium">
          <p>© 2026 BusTix Enterprise. Built with ❤️ for seamless travel.</p>
        </div>
      </footer>
    </div>
  )
}
