import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { busApi, bookingApi } from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FaBus, FaChair, FaClock, FaMapMarkerAlt, FaRupeeSign, FaLock, FaInfoCircle } from 'react-icons/fa'

export default function SeatSelectionPage() {
  const { scheduleId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const bus = state?.bus
  const [seats, setSeats] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [locking, setLocking] = useState(false)

  useEffect(() => {
    if (!bus) { navigate('/search'); return }
    busApi.getScheduleSeats(scheduleId)
      .then(r => setSeats(r.data.data || []))
      .catch(() => toast.error('Failed to load seat map'))
      .finally(() => setLoading(false))
  }, [scheduleId, bus])

  // Auto-refresh seat availability every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      if (scheduleId) {
        busApi.getScheduleSeats(scheduleId).then(r => setSeats(r.data.data || []))
      }
    }, 30000)
    return () => clearInterval(timer)
  }, [scheduleId])

  const toggleSeat = (seat) => {
    if (seat.status === 'BOOKED' || seat.locked) return
    const isSelected = selected.includes(seat.seatNumber)
    const maxSeats = Number(state?.form?.seats || 1)

    if (!isSelected && selected.length >= maxSeats) {
      toast.error(`You can only select ${maxSeats} seat(s)`)
      return
    }

    setSelected(prev =>
      isSelected ? prev.filter(s => s !== seat.seatNumber) : [...prev, seat.seatNumber]
    )
  }

  const handleProceed = async () => {
    if (selected.length === 0) { toast.error('Please select at least one seat'); return }
    setLocking(true)
    try {
      await bookingApi.lockSeats({
        scheduleId: scheduleId,
        seatNumbers: selected,
        userId: user.id,
      })
      navigate('/booking/confirm', {
        state: { bus, selected, scheduleId, form: state?.form }
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Seat lock failed. Seats may have been taken.')
      busApi.getScheduleSeats(scheduleId).then(r => setSeats(r.data.data || []))
      setSelected([])
    } finally {
      setLocking(false)
    }
  }

  // Group seats by row
  const rows = {}
  seats.forEach(s => {
    const row = s.seatNumber[0]
    if (!rows[row]) rows[row] = []
    rows[row].push(s)
  })

  const seatClass = (seat) => {
    if (seat.status === 'BOOKED') return 'seat-booked'
    if (seat.locked) return 'seat-locked'
    if (selected.includes(seat.seatNumber)) return 'seat-selected'
    return 'seat-available'
  }

  const totalPrice = bus ? (Number(bus.pricePerSeat) * selected.length) : 0

  const fmtTime = (t) => {
    if (!t) return '--'
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-slate-50">
      <div className="page-container max-w-5xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight mb-2">Select Your Seats</h1>
          {bus && (
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-semibold">
              <span className="flex items-center gap-1"><FaBus className="text-indigo-600" /> {bus.busName} ({bus.busNumber})</span>
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-emerald-500" /> {bus.source}
                <span className="text-indigo-500">→</span>
                <FaMapMarkerAlt className="text-rose-500" /> {bus.destination}
              </span>
              <span className="flex items-center gap-1"><FaClock className="text-indigo-600" /> {fmtTime(bus.departureTime)} → {fmtTime(bus.arrivalTime)}</span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Seat Map ── */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-6">
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 text-xs">
                {[
                  { cls: 'w-6 h-6 rounded bg-white border border-slate-300', label: 'Available' },
                  { cls: 'w-6 h-6 rounded bg-indigo-600 border border-indigo-750', label: 'Selected' },
                  { cls: 'w-6 h-6 rounded bg-slate-100 border border-slate-200', label: 'Booked' },
                  { cls: 'w-6 h-6 rounded bg-amber-50 border border-amber-250', label: 'Locked' },
                ].map(({ cls, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={cls} />
                    <span className="text-slate-650 font-bold">{label}</span>
                  </div>
                ))}
              </div>

              {/* Bus front indicator */}
              <div className="w-full flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
                  <FaBus className="text-indigo-600" />
                  <span>Driver Cabin</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 border border-slate-250 rounded-lg px-2.5 py-1 text-slate-600 text-xs font-semibold">
                  <svg className="w-4 h-4 text-slate-600 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="2" />
                    <path d="M12 3v7M3 12h7M14 12h7M8.5 15.5l3.5-3.5M15.5 15.5l-3.5-3.5" />
                  </svg>
                  Steering Wheel
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(rows).map(([row, rowSeats]) => (
                    <div key={row} className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs w-4 text-center">{row}</span>
                      <div className="flex gap-2 flex-wrap">
                        {rowSeats.slice(0, Math.ceil(rowSeats.length / 2)).map(seat => (
                          <button
                            key={seat.seatNumber}
                            onClick={() => toggleSeat(seat)}
                            className={seatClass(seat)}
                            title={`Seat ${seat.seatNumber} - ${seat.seatType}`}
                          >
                            {seat.seatNumber.slice(1)}
                          </button>
                        ))}
                        <div className="w-6" /> {/* Aisle gap */}
                        {rowSeats.slice(Math.ceil(rowSeats.length / 2)).map(seat => (
                          <button
                            key={seat.seatNumber}
                            onClick={() => toggleSeat(seat)}
                            className={seatClass(seat)}
                            title={`Seat ${seat.seatNumber} - ${seat.seatType}`}
                          >
                            {seat.seatNumber.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <FaInfoCircle className="text-indigo-500" />
                Seats are locked for 10 minutes after selection. Proceed quickly!
              </div>
            </div>
          </div>

          {/* ── Booking Summary ── */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 sticky top-24">
              <h3 className="font-bold text-lg text-slate-800 mb-4">Booking Summary</h3>

              {bus && (
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-semibold">Route</span>
                    <span className="text-slate-800 font-bold">{bus.source} → {bus.destination}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-semibold">Date</span>
                    <span className="text-slate-800 font-bold">{bus.travelDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-semibold">Departure</span>
                    <span className="text-slate-800 font-bold">{fmtTime(bus.departureTime)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-semibold">Price/Seat</span>
                    <span className="text-slate-800 font-bold">₹{Number(bus.pricePerSeat).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 pt-4 mb-4">
                <p className="text-slate-500 text-sm mb-2 font-semibold">Selected Seats</p>
                {selected.length === 0 ? (
                  <p className="text-slate-450 text-sm font-medium">No seats selected</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selected.map(s => (
                      <span key={s} className="badge badge-info">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-indigo-600">₹{totalPrice.toLocaleString()}</span>
                </div>
                {selected.length > 0 && (
                  <p className="text-slate-500 text-xs mt-1.5 font-bold">
                    {selected.length} seat{selected.length > 1 ? 's' : ''} × ₹{Number(bus?.pricePerSeat).toLocaleString()}
                  </p>
                )}
              </div>

              <button
                onClick={handleProceed}
                disabled={selected.length === 0 || locking}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {locking
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Locking seats...</>
                  : <><FaLock /> Proceed to Book</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
