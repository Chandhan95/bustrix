import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { bookingApi } from '../api'
import { QRCodeCanvas } from 'qrcode.react'
import toast from 'react-hot-toast'
import {
  FaBus, FaMapMarkerAlt, FaClock, FaChair, FaQrcode,
  FaDownload, FaCheckCircle, FaCalendarAlt, FaUser,
  FaEnvelope, FaPhone, FaRupeeSign
} from 'react-icons/fa'

export default function TicketPage() {
  const { pnr } = useParams()
  const { state } = useLocation()
  const [booking, setBooking] = useState(state?.booking || null)
  const [loading, setLoading] = useState(!state?.booking)

  useEffect(() => {
    if (!booking) {
      bookingApi.getByPnr(pnr)
        .then(r => setBooking(r.data.data))
        .catch(() => toast.error('Ticket not found'))
        .finally(() => setLoading(false))
    }
  }, [pnr])

  const fmtTime = (t) => {
    if (!t) return '--'
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const handlePrint = () => window.print()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-650 rounded-full animate-spin" />
    </div>
  )

  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 font-semibold bg-slate-50">Ticket not found</div>
  )

  const qrData = `PNR:${booking.pnrNumber}|BUS:${booking.busNumber}|FROM:${booking.source}|TO:${booking.destination}|DATE:${booking.travelDate}|SEATS:${booking.bookedSeats?.join(',')}`

  return (
    <div className="min-h-screen print:min-h-0 pt-20 print:pt-4 pb-12 print:pb-0 bg-slate-50 print:bg-white">
      <div className="page-container max-w-2xl print:max-w-none print:px-0">

        {/* Success banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8 print:hidden"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full shadow-lg mb-4"
          >
            <FaCheckCircle className="text-white text-4xl" />
          </motion.div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight mb-2">Booking Confirmed! 🎉</h1>
          <p className="text-slate-500 font-semibold">Your QR ticket is ready. Have a safe journey!</p>
        </motion.div>

        {/* ── Ticket Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden"
        >
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaBus className="text-white text-xl" />
                <span className="font-display font-bold text-xl text-white">BusTix</span>
              </div>
              <span className={`badge ${booking.status === 'CONFIRMED' ? 'badge-success' : 'badge-danger'}`}>
                {booking.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">PNR Number</p>
                <p className="font-mono font-bold text-2xl text-white tracking-widest">{booking.pnrNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">Amount Paid</p>
                <p className="font-bold text-2xl text-white">₹{Number(booking.finalAmount).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Dashed divider */}
          <div className="relative h-4 bg-slate-50">
            <div className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-slate-200" />
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border border-slate-200" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border border-slate-200" />
          </div>

          <div className="p-6 space-y-6">
            {/* Route */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-slate-800">{booking.source}</p>
                <p className="text-slate-500 text-sm font-semibold">{fmtTime(booking.departureTime)}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-indigo-600">
                  <div className="w-12 h-px bg-indigo-200" />
                  <FaBus />
                  <div className="w-12 h-px bg-indigo-200" />
                </div>
                <p className="text-slate-500 text-xs mt-1 font-semibold">{booking.busType?.replace('_', ' ')}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-slate-800">{booking.destination}</p>
                <p className="text-slate-500 text-sm font-semibold">{fmtTime(booking.arrivalTime)}</p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <FaCalendarAlt className="text-indigo-600" />, label: 'Date', value: booking.travelDate },
                { icon: <FaBus className="text-amber-600" />, label: 'Bus', value: `${booking.busName} (${booking.busNumber})` },
                { icon: <FaChair className="text-emerald-600" />, label: 'Seats', value: booking.bookedSeats?.join(', ') },
                { icon: <FaUser className="text-blue-650" />, label: 'Passenger', value: booking.passengerName },
                { icon: <FaEnvelope className="text-rose-600" />, label: 'Email', value: booking.passengerEmail },
                { icon: <FaPhone className="text-teal-650" />, label: 'Phone', value: booking.passengerPhone },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-slate-50 border border-slate-150 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {icon}
                    <span className="text-slate-500 text-xs font-semibold">{label}</span>
                  </div>
                  <p className="text-slate-800 text-sm font-bold truncate">{value}</p>
                </div>
              ))}
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center bg-slate-50 border border-slate-150 rounded-2xl p-6">
              <p className="text-slate-700 font-bold mb-4 flex items-center gap-2">
                <FaQrcode className="text-indigo-600" /> Boarding QR Code
              </p>
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <QRCodeCanvas value={qrData} size={180} />
              </div>
              <p className="text-slate-550 text-slate-500 text-xs mt-3 text-center font-semibold">
                Show this QR code to the conductor at the time of boarding
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 !py-3"
              >
                <FaDownload /> Download Ticket
              </button>
              <button
                onClick={() => window.location.href = '/bookings'}
                className="btn-primary flex-1 flex items-center justify-center gap-2 !py-3"
              >
                My Bookings
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
