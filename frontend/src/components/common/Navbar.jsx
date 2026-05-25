import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import {
  FaBus, FaSearch, FaTicketAlt, FaUser, FaTachometerAlt,
  FaSignOutAlt, FaBars, FaTimes, FaChevronDown
} from 'react-icons/fa'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Home', icon: <FaBus /> },
    { to: '/search', label: 'Search Buses', icon: <FaSearch /> },
    ...(isAuthenticated ? [{ to: '/bookings', label: 'My Bookings', icon: <FaTicketAlt /> }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Dashboard', icon: <FaTachometerAlt /> }] : []),
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="navbar print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 shadow-sm">
              <FaBus className="text-white text-sm" />
            </div>
            <span className="font-display font-black text-xl text-slate-800 tracking-tight">BusTix</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/80'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 transition-all"
                >
                  <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user?.firstName?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{user?.firstName}</span>
                  <FaChevronDown className={`text-slate-500 text-xs transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-sm font-bold text-slate-800">{user?.fullName}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                        <span className={`badge mt-1.5 ${isAdmin ? 'badge-warning' : 'badge-info'}`}>
                          {user?.role}
                        </span>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all font-medium"
                        >
                          <FaUser className="text-slate-400" /> Profile
                        </Link>
                        <Link
                          to="/bookings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all font-medium"
                        >
                          <FaTicketAlt className="text-slate-400" /> My Bookings
                        </Link>
                        <button
                          onClick={() => { logout(); setDropdownOpen(false); navigate('/') }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <FaSignOutAlt /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary !py-2 !px-5 !text-sm">Login</Link>
                <Link to="/register" className="btn-primary !py-2 !px-5 !text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-slate-600 hover:text-slate-900"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive(link.to)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={() => { logout(); setMobileOpen(false); navigate('/') }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all"
                >
                  <FaSignOutAlt /> Logout
                </button>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-center !py-2 !text-sm">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-center !py-2 !text-sm">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
