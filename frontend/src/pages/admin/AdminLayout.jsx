import { Outlet, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaTachometerAlt, FaBus, FaRoute, FaCalendarAlt,
  FaUsers, FaChevronRight
} from 'react-icons/fa'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: <FaTachometerAlt />, end: true },
  { to: '/admin/buses', label: 'Buses', icon: <FaBus /> },
  { to: '/admin/routes', label: 'Routes', icon: <FaRoute /> },
  { to: '/admin/schedules', label: 'Schedules', icon: <FaCalendarAlt /> },
  { to: '/admin/users', label: 'Users', icon: <FaUsers /> },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen pt-16 flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 hidden lg:flex flex-col fixed left-0 top-16 bottom-0 border-r border-slate-200 bg-white pt-6 px-4 z-40">
        <div className="mb-6 px-2">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Admin Panel</p>
          <p className="text-slate-800 font-bold text-base">BusTix Enterprise</p>
        </div>

        <nav className="space-y-1.5 flex-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group border ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'text-slate-600 hover:text-indigo-650 hover:bg-slate-50 border-transparent'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              <FaChevronRight className="ml-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pb-6 px-2">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
            <p className="text-xs text-indigo-700 font-bold mb-0.5">Admin Mode</p>
            <p className="text-xs text-slate-500 font-semibold">Full system access</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-8 bg-slate-50">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
