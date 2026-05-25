import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import { bookingApi } from '../api'
import toast from 'react-hot-toast'
import {
  FaBus, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaClock, FaChair, FaRupeeSign, FaShieldAlt, FaCheckCircle
} from 'react-icons/fa'

export default function BookingConfirmPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('UPI')

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      passengerName: user?.fullName || `${user?.firstName} ${user?.lastName}`,
      passengerEmail: user?.email || '',
      passengerPhone: user?.phone || '',
    }
  })

  const { bus, selected, scheduleId } = state || {}

  if (!bus || !selected) {
    navigate('/search')
    return null
  }

  const fmtTime = (t) => {
    if (!t) return '--'
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const totalPrice = Number(bus.pricePerSeat) * selected.length

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await bookingApi.create({
        scheduleId: Number(scheduleId),
        seatNumbers: selected,
        passengerName: data.passengerName,
        passengerEmail: data.passengerEmail,
        passengerPhone: data.passengerPhone,
        paymentMethod,
      })
      const booking = res.data.data
      toast.success('Booking confirmed! Check your email for QR code 🎉')
      navigate(`/ticket/${booking.pnrNumber}`, { state: { booking } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const paymentMethods = [
    { id: 'UPI', label: 'UPI', icon: '📱' },
    { id: 'CARD', label: 'Card', icon: '💳' },
    { id: 'NET_BANKING', label: 'Net Banking', icon: '🏦' },
    { id: 'WALLET', label: 'Wallet', icon: '👝' },
  ]

  return (
    <div className="min-h-screen pt-20 pb-12 bg-slate-50">
      <div className="page-container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight mb-2">Complete Your Booking</h1>
          <p className="text-slate-500 mb-8 font-medium">Review details and confirm your ticket</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left: Passenger + Payment ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Passenger Details */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-semibold text-lg text-slate-800 mb-5 flex items-center gap-2 font-bold">
                  <FaUser className="text-indigo-600" /> Passenger Details
                </h2>
                <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="input-label">Full Name</label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                      <input
                        className={`input-field pl-10 text-sm font-medium ${errors.passengerName ? 'border-red-500' : ''}`}
                        placeholder="Full name as on ID"
                        {...register('passengerName', { required: 'Name is required' })}
                      />
                    </div>
                    {errors.passengerName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.passengerName.message}</p>}
                  </div>

                  <div>
                    <label className="input-label">Email Address</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                      <input
                        type="email"
                        className={`input-field pl-10 text-sm font-medium ${errors.passengerEmail ? 'border-red-500' : ''}`}
                        placeholder="Ticket will be sent here"
                        {...register('passengerEmail', {
                          required: 'Email is required',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                        })}
                      />
                    </div>
                    {errors.passengerEmail && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.passengerEmail.message}</p>}
                  </div>

                  <div>
                    <label className="input-label">Phone Number</label>
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                      <input
                        className={`input-field pl-10 text-sm font-medium ${errors.passengerPhone ? 'border-red-500' : ''}`}
                        placeholder="10-digit mobile number"
                        {...register('passengerPhone', {
                          required: 'Phone is required',
                          pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone number' }
                        })}
                      />
                    </div>
                    {errors.passengerPhone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.passengerPhone.message}</p>}
                  </div>
                </form>
              </div>

              {/* Payment Method */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-semibold text-lg text-slate-800 mb-5 flex items-center gap-2 font-bold">
                  <FaRupeeSign className="text-indigo-600" /> Payment Method
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {paymentMethods.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        paymentMethod === m.id
                          ? 'border-indigo-650 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 font-semibold'
                      }`}
                    >
                      <div className="text-2xl mb-1">{m.icon}</div>
                      <div className="text-sm">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-250 rounded-2xl p-4">
                <FaShieldAlt className="text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-emerald-800 text-sm font-semibold">
                  Your payment is fully secured with 256-bit encryption. We never store your payment details.
                </p>
              </div>
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="glass-card rounded-2xl p-6 sticky top-24 space-y-4">
                <h3 className="font-bold text-lg text-slate-800">Order Summary</h3>

                {/* Bus info */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaBus className="text-indigo-600 text-sm" />
                    <span className="font-bold text-sm text-slate-800">{bus.busName}</span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold">
                      <FaMapMarkerAlt className="text-emerald-600 text-xs" />
                      {bus.source} → {bus.destination}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 font-semibold">
                      <FaClock className="text-indigo-600 text-xs" />
                      {fmtTime(bus.departureTime)} → {fmtTime(bus.arrivalTime)}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 font-semibold">
                      <FaChair className="text-amber-600 text-xs" />
                      Seats: {selected.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="space-y-2 text-sm font-semibold">
                  <div className="flex justify-between text-slate-500">
                    <span>Fare × {selected.length}</span>
                    <span className="text-slate-800 font-bold">₹{(Number(bus.pricePerSeat) * selected.length).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Service Fee</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="text-2xl font-black text-indigo-600">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  form="booking-form"
                  type="submit"
                  disabled={loading}
                  className="btn-success w-full py-3.5 flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                    : <><FaCheckCircle /> Confirm & Pay ₹{totalPrice.toLocaleString()}</>
                  }
                </button>

                <p className="text-xs text-slate-500 text-center font-medium">
                  By booking you agree to our Terms & Cancellation Policy
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
