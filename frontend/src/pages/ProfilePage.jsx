import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaCalendarAlt, FaTicketAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen pt-20 pb-12 bg-slate-50">
      <div className="page-container max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight mb-8">My Profile</h1>

          {/* Avatar Card */}
          <div className="glass-card rounded-2xl p-8 mb-6 text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-700 text-4xl font-black mx-auto mb-4 border border-indigo-200 shadow-sm">
              {user?.firstName?.[0]?.toUpperCase()}
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-800">{user?.fullName || `${user?.firstName} ${user?.lastName}`}</h2>
            <p className="text-slate-500 mt-1 font-semibold">{user?.email}</p>
            <span className={`badge mt-3 ${user?.role === 'ADMIN' ? 'badge-warning' : 'badge-info'}`}>
              {user?.role}
            </span>
          </div>

          {/* Details */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-lg text-slate-800 mb-5">Account Information</h3>
            <div className="space-y-4 font-semibold">
              {[
                { icon: <FaUser className="text-indigo-650 text-indigo-600" />, label: 'Full Name', value: user?.fullName || `${user?.firstName} ${user?.lastName}` },
                { icon: <FaEnvelope className="text-blue-600" />, label: 'Email Address', value: user?.email },
                { icon: <FaPhone className="text-emerald-600" />, label: 'Phone Number', value: user?.phone || 'Not provided' },
                { icon: <FaShieldAlt className="text-amber-600" />, label: 'Account Role', value: user?.role },
                { icon: <FaCalendarAlt className="text-purple-600" />, label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '--' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 bg-slate-50 border border-slate-150 rounded-xl p-4">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    {icon}
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">{label}</p>
                    <p className="text-slate-800 text-sm font-bold">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/bookings" className="glass-card-hover rounded-2xl p-5 text-center">
              <FaTicketAlt className="text-indigo-600 text-2xl mx-auto mb-2 animate-pulse" />
              <p className="font-bold text-slate-800 text-sm md:text-base">My Bookings</p>
              <p className="text-slate-500 text-xs font-semibold">View all trips</p>
            </Link>
            <Link to="/search" className="glass-card-hover rounded-2xl p-5 text-center">
              <span className="text-2xl block mb-2">🚌</span>
              <p className="font-bold text-slate-800 text-sm md:text-base">Book a Trip</p>
              <p className="text-slate-500 text-xs font-semibold">Find buses</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
