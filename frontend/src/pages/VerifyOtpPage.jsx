import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../api'
import toast from 'react-hot-toast'
import { FaEnvelope, FaBus } from 'react-icons/fa'

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      await authApi.verifyOtp(email, otp)
      toast.success('Email verified successfully! Welcome to BusTix 🎉')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 py-8 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-sm mb-3">
            <FaBus className="text-white text-xl" />
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight">Verify Your Email</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">We've sent a 6-digit code to {email}</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-lg rounded-3xl p-8">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="input-label">Enter 6-Digit OTP</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  <FaEnvelope />
                </span>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="input-field pl-10 tracking-widest text-lg font-bold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl mt-4 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Verify & Continue'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
