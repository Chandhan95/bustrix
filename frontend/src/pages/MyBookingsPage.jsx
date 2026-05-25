import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { bookingApi } from '../api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  FaTicketAlt, FaMapMarkerAlt, FaBus, FaClock,
  FaCalendarAlt, FaChair, FaRupeeSign, FaTimes,
  FaEye, FaSearch, FaFilter
} from 'react-icons/fa'

export default function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filter, setFilter] = useState('ALL')
  const [cancelModal, setCancelModal] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => { fetchBookings() }, [page])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await bookingApi.getMyBookings(page, 10)
      const data = res.data.data
      setBookings(data.content || [])
      setTotalPages(data.totalPages || 0)
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Please provide a cancellation reason'); return }
    setCancelling(true)
    try {
      await bookingApi.cancel(cancelModal.id, cancelReason)
      toast.success('Booking cancelled successfully. Refund will be processed.')
      setCancelModal(null)
      setCancelReason('')
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed')
    } finally {
      setCancelling(false)
    }
  }

  const fmtTime = (t) => {
    if (!t) return '--'
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const statusConfig = {
    CONFIRMED: { cls: 'badge-success', label: 'Confirmed' },
    PENDING: { cls: 'badge-warning', label: 'Pending' },
    CANCELLED: { cls: 'badge-danger', label: 'Cancelled' },
    COMPLETED: { cls: 'badge-info', label: 'Completed' },
  }

  const filtered = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className="min-h-screen pt-20 pb-12 bg-slate-50">
      <div className="page-container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight">My Bookings</h1>
              <p className="text-slate-500 mt-1.5 font-medium">Track and manage all your bus tickets</p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap font-semibold">
              {['ALL', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-white text-slate-650 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="glass-card rounded-2xl p-6 animate-pulse space-y-3">
                  <div className="flex justify-between">
                    <div className="h-5 w-48 skeleton rounded" />
                    <div className="h-6 w-24 skeleton rounded-full" />
                  </div>
                  <div className="h-4 w-64 skeleton rounded" />
                  <div className="grid grid-cols-3 gap-3">
                    {[1,2,3].map(j => <div key={j} className="h-10 skeleton rounded-xl" />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No bookings */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">No bookings yet</h3>
              <p className="text-slate-500 mb-6 font-medium">Book your first bus ticket to see it here</p>
              <button onClick={() => navigate('/search')} className="btn-primary">
                Search Buses
              </button>
            </div>
          )}

          {/* Booking cards */}
          <AnimatePresence>
            {filtered.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card-hover rounded-2xl p-6 mb-4 transition-all"
              >
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-mono font-bold text-lg text-slate-800">{booking.pnrNumber}</p>
                      <span className={`badge ${statusConfig[booking.status]?.cls || 'badge-info'}`}>
                        {statusConfig[booking.status]?.label || booking.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm flex items-center gap-2 font-semibold">
                      <FaBus className="text-indigo-650 text-xs" />
                      {booking.busName} · {booking.busNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-indigo-600">₹{Number(booking.finalAmount).toLocaleString()}</p>
                    <p className="text-slate-500 text-xs font-semibold">{booking.paymentMethod?.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-center min-w-[70px]">
                    <p className="font-bold text-slate-800">{booking.source}</p>
                    <p className="text-xs text-slate-500 font-semibold">{fmtTime(booking.departureTime)}</p>
                  </div>
                  <div className="flex-1 flex items-center">
                    <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-rose-500/50" />
                    <FaBus className="text-indigo-600 mx-2 text-xs" />
                    <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 to-rose-500/50" />
                  </div>
                  <div className="text-center min-w-[70px]">
                    <p className="font-bold text-slate-800">{booking.destination}</p>
                    <p className="text-xs text-slate-500 font-semibold">{fmtTime(booking.arrivalTime)}</p>
                  </div>
                </div>

                {/* Details row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 font-semibold">
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5">
                    <p className="text-slate-550 text-slate-500 text-xs mb-0.5 flex items-center gap-1"><FaCalendarAlt className="text-indigo-500" /> Date</p>
                    <p className="text-slate-800 text-sm font-bold">{booking.travelDate}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5">
                    <p className="text-slate-550 text-slate-500 text-xs mb-0.5 flex items-center gap-1"><FaChair className="text-indigo-500" /> Seats</p>
                    <p className="text-slate-800 text-sm font-bold">{booking.bookedSeats?.join(', ')}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5">
                    <p className="text-slate-550 text-slate-500 text-xs mb-0.5">Type</p>
                    <p className="text-slate-800 text-sm font-bold">{booking.busType?.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => navigate(`/ticket/${booking.pnrNumber}`, { state: { booking } })}
                    className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-2"
                  >
                    <FaEye /> View Ticket
                  </button>
                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => setCancelModal(booking)}
                      className="btn-danger !py-2 !px-4 !text-sm flex items-center gap-2"
                    >
                      <FaTimes /> Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary !py-2 !px-4 disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="flex items-center px-4 text-slate-600 text-sm font-bold">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-secondary !py-2 !px-4 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Cancel Modal ── */}
      <AnimatePresence>
        {cancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setCancelModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 max-w-md w-full"
            >
              <h3 className="font-bold text-xl text-slate-800 mb-2">Cancel Booking</h3>
              <p className="text-slate-500 text-sm mb-4 font-semibold">
                PNR: <span className="font-mono text-slate-850 font-bold text-slate-800">{cancelModal.pnrNumber}</span><br />
                {cancelModal.source} → {cancelModal.destination} · {cancelModal.travelDate}
              </p>

              <div className="bg-amber-50 border border-amber-250 rounded-xl p-3 mb-4 text-amber-800 text-sm font-semibold">
                ⚠️ Cancellation refund will be processed within 5-7 working days.
              </div>

              <label className="input-label">Reason for cancellation</label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Please provide a reason..."
                rows={3}
                className="input-field resize-none mb-4 font-semibold text-sm"
              />

              <div className="flex gap-3">
                <button onClick={() => setCancelModal(null)} className="btn-secondary flex-1 !py-2.5">
                  Keep Booking
                </button>
                <button onClick={handleCancel} disabled={cancelling} className="btn-danger flex-1 !py-2.5">
                  {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
