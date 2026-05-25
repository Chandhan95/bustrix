import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { adminApi } from '../../api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  FaUsers, FaBus, FaRoute, FaTicketAlt,
  FaRupeeSign, FaChartLine, FaArrowUp, FaCalendarAlt
} from 'react-icons/fa'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getDashboard()
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers?.toLocaleString(), icon: <FaUsers />, color: 'from-blue-500 to-indigo-500', sub: 'Registered users' },
    { label: 'Active Buses', value: stats.totalBuses?.toLocaleString(), icon: <FaBus />, color: 'from-emerald-500 to-teal-500', sub: 'Operational fleet' },
    { label: 'Active Routes', value: stats.totalRoutes?.toLocaleString(), icon: <FaRoute />, color: 'from-amber-500 to-orange-500', sub: 'Connected routes' },
    { label: 'Total Bookings', value: stats.totalBookings?.toLocaleString(), icon: <FaTicketAlt />, color: 'from-purple-500 to-indigo-500', sub: `${stats.confirmedBookings} confirmed` },
    { label: "Today's Revenue", value: `₹${Number(stats.todayRevenue || 0).toLocaleString()}`, icon: <FaRupeeSign />, color: 'from-rose-500 to-pink-500', sub: `${stats.todayBookings || 0} bookings today` },
    { label: 'Total Revenue', value: `₹${Number(stats.totalRevenue || 0).toLocaleString()}`, icon: <FaChartLine />, color: 'from-cyan-500 to-blue-500', sub: 'All-time earnings' },
  ] : []

  const bookingChartData = stats?.bookingsByMonth
    ? Object.entries(stats.bookingsByMonth).map(([month, count]) => ({ month: month.slice(0, 3), count }))
    : []

  const bookingStatusData = stats ? [
    { name: 'Confirmed', value: Number(stats.confirmedBookings || 0) },
    { name: 'Cancelled', value: Number(stats.cancelledBookings || 0) },
    { name: 'Pending', value: Math.max(0, Number(stats.totalBookings || 0) - Number(stats.confirmedBookings || 0) - Number(stats.cancelledBookings || 0)) },
  ].filter(d => d.value > 0) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-2xl md:text-3xl text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1.5 font-medium">Welcome back, Admin! Here's your business overview.</p>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
          <FaCalendarAlt className="text-indigo-650 text-indigo-600" />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-card rounded-2xl p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="stat-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-white text-lg`}>
                  {card.icon}
                </div>
                <FaArrowUp className="text-emerald-600 text-xs" />
              </div>
              <p className="font-display font-black text-2xl text-slate-800 mb-0.5">{card.value}</p>
              <p className="text-slate-500 text-sm font-bold">{card.label}</p>
              <p className="text-slate-400 text-xs mt-0.5 font-semibold">{card.sub}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Bookings Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-slate-800 mb-4 font-bold">Monthly Bookings (This Year)</h3>
          {bookingChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bookingChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12, fontWeight: '500' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12, fontWeight: '500' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontWeight: '500', fontSize: '13px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-500 font-semibold">No booking data yet</div>
          )}
        </div>

        {/* Booking Status Pie */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-slate-800 mb-4 font-bold">Booking Status</h3>
          {bookingStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bookingStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false}>
                  {bookingStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontWeight: '500', fontSize: '13px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-500 font-semibold">No data yet</div>
          )}
        </div>
      </div>

      {/* Top Routes */}
      {stats?.topRoutes && Object.keys(stats.topRoutes).length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-semibold text-slate-800 mb-4 font-bold">Top Performing Routes</h3>
          <div className="space-y-4">
            {Object.entries(stats.topRoutes).map(([route, count], i) => {
              const maxCount = Math.max(...Object.values(stats.topRoutes))
              const pct = (count / maxCount) * 100
              return (
                <div key={route}>
                  <div className="flex justify-between items-center mb-1.5 font-bold">
                    <span className="text-slate-705 text-slate-700 text-sm">{route}</span>
                    <span className="text-indigo-600 text-sm">{count} bookings</span>
                  </div>
                  <div className="h-2 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
