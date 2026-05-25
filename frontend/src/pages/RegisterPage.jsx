import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBus, FaEye, FaEyeSlash } from 'react-icons/fa'

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const pwd = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await registerUser({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        password: data.password,
        phone: data.phone.trim(),
      })
      toast.success('OTP sent to your email!')
      navigate(`/verify-otp?email=${encodeURIComponent(data.email.trim())}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, name, icon, type = 'text', placeholder, rules, extra }) => (
    <div>
      <label className="input-label">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          className={`input-field pl-10 ${extra || ''} ${errors[name] ? 'border-red-500' : ''}`}
          {...register(name, rules)}
        />
      </div>
      {errors[name] && <p className="text-red-500 text-xs mt-1 font-semibold">{errors[name].message}</p>}
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 py-8 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-sm mb-3">
            <FaBus className="text-white text-xl" />
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Join BusTix and start travelling</p>
        </div>

        <div className="bg-white border border-slate-200 shadow-lg rounded-3xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" name="firstName" icon={<FaUser />} placeholder="John"
                rules={{ required: 'Required', minLength: { value: 2, message: 'Too short' } }} />
              <Field label="Last Name" name="lastName" icon={<FaUser />} placeholder="Doe"
                rules={{ required: 'Required', minLength: { value: 2, message: 'Too short' } }} />
            </div>

            <Field label="Email Address" name="email" icon={<FaEnvelope />}
              type="email" placeholder="you@example.com"
              rules={{
                required: 'Email is required',
                pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Invalid email address format' }
              }} />

            <Field label="Phone Number" name="phone" icon={<FaPhone />}
              placeholder="9876543210"
              rules={{
                required: 'Phone is required',
                pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid Indian phone number' }
              }} />

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min 8 chars with uppercase, number & symbol"
                  className={`input-field pl-10 pr-12 text-sm font-medium ${errors.password ? 'border-red-500' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters' },
                    pattern: {
                      value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/,
                      message: 'Must have uppercase, lowercase, number & special char'
                    }
                  })}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPwd ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password.message}</p>}
            </div>

            <div>
              <label className="input-label">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="password"
                  placeholder="Repeat your password"
                  className={`input-field pl-10 text-sm font-medium ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: v => v === pwd || 'Passwords do not match'
                  })}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
